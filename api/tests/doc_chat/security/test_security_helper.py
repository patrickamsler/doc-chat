import uuid

from doc_chat.security.security_helper import create_guest_cookie, \
    _verify_guest_cookie_and_return_user, GUEST_TTL, GUEST_COOKIE, \
    get_current_user, is_user_authenticated
from unittest.mock import patch
from fastapi import HTTPException, Request


def create_test_request(guest_uid: str = None) -> Request:
    cookies = {}
    if guest_uid:
        cookies[GUEST_COOKIE] = create_guest_cookie(guest_uid)
    return type('Request', (), {'cookies': cookies})()


@patch.dict("os.environ", {"GUEST_SIGNING_SECRET": "testsecret"})
def test_verify_guest_cookie_and_return_user():
    # given
    guest_uid = "123e4567-e89b-12d3-a456-426614174000"
    cookie = create_guest_cookie(guest_uid)

    # when
    user = _verify_guest_cookie_and_return_user(cookie)

    # then
    assert user.id == guest_uid
    assert user.is_guest is True


@patch.dict("os.environ", {"GUEST_SIGNING_SECRET": "testsecret"})
def test_verify_guest_cookie_and_return_user_invalid_signature():
    # given
    guest_uid = "123e4567-e89b-12d3-a456-426614174000"
    cookie = create_guest_cookie(guest_uid)
    invalid_cookie = cookie[:-1] + "x"  # change the last character to invalidate the signature

    # when/then
    try:
        _verify_guest_cookie_and_return_user(invalid_cookie)
        assert False, "Expected HTTPException for invalid signature"
    except HTTPException as e:
        assert e.status_code == 401
        assert e.detail == "Invalid guest cookie signature"


@patch.dict("os.environ", {"GUEST_SIGNING_SECRET": "testsecret"})
@patch("time.time")
def test_verify_guest_cookie_and_return_user_cookie_expired(mock_time):
    # given
    guest_uid = uuid.uuid4().hex
    issued_at = 1000000
    mock_time.return_value = issued_at
    cookie = create_guest_cookie(guest_uid)
    # simulate time after expiration
    mock_time.return_value = issued_at + GUEST_TTL + 1

    # when/then
    try:
        _verify_guest_cookie_and_return_user(cookie)
        assert False, "Expected HTTPException for expired cookie"
    except HTTPException as e:
        assert e.status_code == 401
        assert e.detail == "Guest cookie expired"


@patch.dict("os.environ", {"GUEST_SIGNING_SECRET": "testsecret"})
def test_get_current_user_valid_cookie():
    # given
    guest_uid = uuid.uuid4().hex
    request = create_test_request(guest_uid)

    # when
    user = get_current_user(request)

    # then
    assert user.id == guest_uid


@patch.dict("os.environ", {"GUEST_SIGNING_SECRET": "testsecret"})
def test_get_current_user_no_cookie():
    # given
    request = create_test_request()

    # when/then
    try:
        _ = get_current_user(request)
        assert False, "Expected HTTPException for no cookie"
    except HTTPException as e:
        assert e.status_code == 401
        assert e.detail == "Not authenticated"


@patch.dict("os.environ", {"GUEST_SIGNING_SECRET": "testsecret"})
def test_is_user_authenticated_with_cookie():
    # given
    guest_uid = uuid.uuid4().hex
    request = create_test_request(guest_uid)

    # when
    is_authenticated = is_user_authenticated(request)

    # then
    assert is_authenticated is True


@patch.dict("os.environ", {"GUEST_SIGNING_SECRET": "testsecret"})
def test_is_user_authenticated_no_cookie():
    # given
    request = create_test_request()

    # when
    is_authenticated = is_user_authenticated(request)

    # then
    assert is_authenticated is False
