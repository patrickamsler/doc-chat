import string

from doc_chat.utils.token_utils import create_token


def test_create_token_length():
    token = create_token()
    # token_urlsafe(16) yields 22 chars, but check for reasonable bounds
    assert 3 <= len(token) <= 63

def test_create_token_first_and_last_alnum():
    token = create_token()
    assert token[0].isalnum()
    assert token[-1].isalnum()

def test_create_token_allowed_characters():
    token = create_token()
    allowed = set(string.ascii_letters + string.digits + '-_')
    assert all(c in allowed for c in token)

def test_create_token_randomness():
    tokens = {create_token() for _ in range(1000)}
    # Should be unique
    assert len(tokens) == 1000

def test_create_token_multiple_runs():
    for _ in range(10):
        token = create_token()
        assert token[0].isalnum()
        assert token[-1].isalnum()
        assert all(c in (string.ascii_letters + string.digits + '-_') for c in token)
        assert 3 <= len(token) <= 63
