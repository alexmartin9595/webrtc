using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Web;
using Microsoft.AspNet.SignalR;
using Microsoft.AspNet.SignalR.Hubs;

namespace WebRTC.Hub
{
    [HubName("conference")]
    public class ConferenceHub : Microsoft.AspNet.SignalR.Hub
    {
        private static readonly Dictionary<string, string> _connections = new Dictionary<string, string>();

        public static Dictionary<string, string> Connections
        {
            get { return _connections; }
        }

        public async Task OnConnected(string userId)
        {
            _connections.Add(Context.ConnectionId, userId);
            await base.OnConnected();
            Clients.All.onUserConnected(userId);
        }

        public async Task OnDisconnected(string userId, bool stopCalled)
        {
            _connections.Remove(Context.ConnectionId);
            await base.OnDisconnected(stopCalled);
        }


        public void SetOffer(object description, string offererId)
        {
            foreach (var connection in _connections)
            {
                Clients.Client(connection.Key).onOfferReceived(description);
            }
        }

        public void AddCandidate(string contentId, object candidate, string recipientId)
        {
            foreach (var connection in _connections)
            {
                Clients.Client(connection.Key).onCandidateReceived(candidate);
            }
        }

        public void SetAnswer(string contentId, object description, string offererId)
        {
            foreach (var connection in _connections)
            {
                Clients.Client(connection.Key).onAnswerReceived(offererId);
            }
        }


    }
}