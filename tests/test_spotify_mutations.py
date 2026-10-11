import unittest
from unittest.mock import Mock, patch
import requests
from api.spotify_mutations import mutate_spotify


class SpotifyMutationsTest(unittest.TestCase):
    @patch('api.spotify_mutations.requests.request')
    def test_library_save(self, send):
        mutate_spotify('stub', 'track', '1')
        args, options = send.call_args
        self.assertEqual(args, ('PUT', 'https://api.spotify.com/v1/me/library'))
        self.assertEqual(options['params'], {'uris': 'spotify:track:track'})
        send.return_value.raise_for_status.assert_called_once()

    @patch('api.spotify_mutations.requests.request')
    def test_playlist_save(self, send):
        mutate_spotify('stub', 'track', 'chosen')
        args, options = send.call_args
        self.assertEqual(args, ('POST', 'https://api.spotify.com/v1/playlists/chosen/items'))
        self.assertEqual(options['json'], {'uris': ['spotify:track:track']})

    @patch('api.spotify_mutations.requests.request')
    def test_removal_only_targets_playlist(self, send):
        mutate_spotify('stub', 'track', 'chosen', remove=True)
        self.assertEqual(send.call_count, 1)
        args, options = send.call_args
        self.assertEqual(args, ('DELETE', 'https://api.spotify.com/v1/playlists/chosen/items'))
        self.assertEqual(options['json'], {'items': [{'uri': 'spotify:track:track'}]})

    @patch('api.spotify_mutations.requests.request')
    def test_library_removal(self, send):
        mutate_spotify('stub', 'track', '1', remove=True)
        self.assertEqual(send.call_args.args, ('DELETE', 'https://api.spotify.com/v1/me/library'))

    @patch('api.spotify_mutations.requests.request')
    def test_rejects_unknown_destination(self, send):
        with self.assertRaises(ValueError):
            mutate_spotify('stub', 'track', 'smart_sort', remove=True)
        send.assert_not_called()

    @patch('api.spotify_mutations.requests.request')
    def test_does_not_swallow_http_error(self, send):
        send.return_value.raise_for_status.side_effect = requests.HTTPError('403')
        with self.assertRaises(requests.HTTPError):
            mutate_spotify('stub', 'track', '1')
        self.assertEqual(send.call_count, 1)

    @patch('api.spotify_mutations.requests.request')
    def test_timeout_is_never_retried(self, send):
        send.side_effect = requests.Timeout()
        with self.assertRaises(requests.Timeout):
            mutate_spotify('stub', 'track', 'chosen')
        self.assertEqual(send.call_count, 1)


if __name__ == '__main__':
    unittest.main()
