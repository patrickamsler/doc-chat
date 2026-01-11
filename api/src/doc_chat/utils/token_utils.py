import secrets
import string

ALNUM = string.ascii_letters + string.digits

def create_token():
    """
    Generate token that is also a valid name for a chroma collection.
    """
    raw = secrets.token_urlsafe(16)   # e.g. "-7Lwa28199pxTaaPrgqaUA"

    #Ensure first char is alphanumeric
    if not raw[0].isalnum():
        raw = secrets.choice(ALNUM) + raw[1:]

    #Ensure last char is alphanumeric
    if not raw[-1].isalnum():
        raw = raw[:-1] + secrets.choice(ALNUM)

    return raw