using Microsoft.AspNetCore.Authentication.BearerToken;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.Data;
using Microsoft.AspNetCore.Identity.UI.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.WebUtilities;
using Microsoft.Extensions.Options;
using System;
using System.Text.Encodings.Web;
using System.Text;

namespace WebChamadosAPI.Services
{
    public static class IdentityEndPoints    {


        public static IEndpointConventionBuilder MapIdentityApiEndPoints<TUser>(this IEndpointRouteBuilder endpoints)
        where TUser : class, new()
        {
            ArgumentNullException.ThrowIfNull(endpoints);

            var timeProvider = endpoints.ServiceProvider.GetRequiredService<TimeProvider>();
            var bearerTokenOptions = endpoints.ServiceProvider.GetRequiredService<IOptionsMonitor<BearerTokenOptions>>();
            var emailSender = endpoints.ServiceProvider.GetRequiredService<IEmailSender<TUser>>();

            var routeGroup = endpoints.MapGroup("");

            routeGroup.MapPost("/login"
                              , async Task<Results<Ok<AccessTokenResponse>, EmptyHttpResult, ProblemHttpResult>>
                ( [FromBody] LoginRequest login
                //, [FromQuery] bool? useCookies
                //, [FromQuery] bool? useSessionCookies
                , [FromServices] IServiceProvider sp) =>
            {
                var signInManager = sp.GetRequiredService<SignInManager<TUser>>();

               // var useCookieScheme = (useCookies == true) || (useSessionCookies == true);
               // var isPersistent = (useCookies == true) && (useSessionCookies != true);
               // signInManager.AuthenticationScheme = useCookieScheme ? IdentityConstants.ApplicationScheme : IdentityConstants.BearerScheme;
                signInManager.AuthenticationScheme = IdentityConstants.BearerScheme;

                var isPersistent = false;

                var result = await signInManager.PasswordSignInAsync(login.Email, login.Password, isPersistent, lockoutOnFailure: true);

                if (result.RequiresTwoFactor)
                {
                    if (!string.IsNullOrEmpty(login.TwoFactorCode))
                    {
                        result = await signInManager.TwoFactorAuthenticatorSignInAsync(login.TwoFactorCode, isPersistent, rememberClient: isPersistent);
                    }
                    else if (!string.IsNullOrEmpty(login.TwoFactorRecoveryCode))
                    {
                        result = await signInManager.TwoFactorRecoveryCodeSignInAsync(login.TwoFactorRecoveryCode);
                    }
                }

                if (!result.Succeeded)
                {
                    return TypedResults.Problem(result.ToString(), statusCode: StatusCodes.Status401Unauthorized);
                }

                // The signInManager already produced the needed response in the form of a cookie or bearer token.
                return TypedResults.Empty;
            });

            routeGroup.MapPost("/refresh", async Task<Results<Ok<AccessTokenResponse>, UnauthorizedHttpResult, SignInHttpResult, ChallengeHttpResult>>
            ([FromBody] RefreshRequest refreshRequest, [FromServices] IServiceProvider sp) =>
            {
                var signInManager = sp.GetRequiredService<SignInManager<TUser>>();
                var refreshTokenProtector = bearerTokenOptions.Get(IdentityConstants.BearerScheme).RefreshTokenProtector;
                var refreshTicket = refreshTokenProtector.Unprotect(refreshRequest.RefreshToken);

                // Reject the /refresh attempt with a 401 if the token expired or the security stamp validation fails
                if (refreshTicket?.Properties?.ExpiresUtc is not { } expiresUtc ||
                    timeProvider.GetUtcNow() >= expiresUtc ||
                    await signInManager.ValidateSecurityStampAsync(refreshTicket.Principal) is not TUser user)

                {
                    return TypedResults.Challenge();
                }

                var newPrincipal = await signInManager.CreateUserPrincipalAsync(user);
                return TypedResults.SignIn(newPrincipal, authenticationScheme: IdentityConstants.BearerScheme);
            });

           

            return new IdentityEndpointsConventionBuilder(routeGroup);

        }

        private sealed class IdentityEndpointsConventionBuilder(RouteGroupBuilder inner) : IEndpointConventionBuilder
        {
            private IEndpointConventionBuilder InnerAsConventionBuilder => inner;

            public void Add(Action<EndpointBuilder> convention) => InnerAsConventionBuilder.Add(convention);
            public void Finally(Action<EndpointBuilder> finallyConvention) => InnerAsConventionBuilder.Finally(finallyConvention);
        }

    }
}
