using Microsoft.Owin;
using Owin;

[assembly: OwinStartupAttribute(typeof(WebRTC.Startup))]
namespace WebRTC
{
    public partial class Startup
    {
        public void Configuration(IAppBuilder app)
        {
            ConfigureAuth(app);
            app.MapSignalR();
        }
    }
}
