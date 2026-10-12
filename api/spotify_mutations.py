"""Single-attempt Spotify mutations using the current Web API routes.

Never retry a write after a timeout: the remote effect may already have happened.
"""
import requests

API_BASE = "https://api.spotify.com/v1"


def mutate_spotify(token: str, track_id: str, playlist_id: str, *, remove: bool = False) -> None:
    if not playlist_id or playlist_id == "smart_sort":
        raise ValueError("An exact destination is required")
    uri = f"spotify:track:{track_id}"
    method = "DELETE" if remove else ("PUT" if playlist_id == "1" else "POST")
    options = {
        "headers": {"Authorization": f"Bearer {token}", "Content-Type": "application/json"},
        "timeout": (5, 20),
    }
    if playlist_id == "1":
        path = "/me/library"
        options["params"] = {"uris": uri}
    else:
        path = f"/playlists/{playlist_id}/items"
        options["json"] = {"items": [{"uri": uri}]} if remove else {"uris": [uri]}
    response = requests.request(method, API_BASE + path, **options)
    response.raise_for_status()
