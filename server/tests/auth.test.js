const auth = require('../middleware/auth');
const jwt = require('jsonwebtoken');

jest.mock('jsonwebtoken');

describe('Auth Middleware (Rigorous)', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      header: jest.fn(),
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  it('should return 401 if x-auth-token header is missing', () => {
    req.header.mockReturnValue(null);

    auth(req, res, next);

    expect(req.header).toHaveBeenCalledWith('x-auth-token');
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ msg: 'No token, authorization denied' });
    expect(next).not.toHaveBeenCalled();
  });

  it('should call next() and attach user if token is valid', () => {
    const token = 'valid_token_123';
    const decodedToken = { user: { id: 500, email: 'test@test.com' } };
    
    req.header.mockReturnValue(token);
    jwt.verify.mockReturnValue(decodedToken); 

    auth(req, res, next);

    expect(jwt.verify).toHaveBeenCalledWith(token, process.env.JWT_SECRET);
    expect(req.user).toEqual(decodedToken.user);
    expect(next).toHaveBeenCalled();
  });

  it('should return 401 if the token is malformed/invalid', () => {
    req.header.mockReturnValue('bad_token');
    jwt.verify.mockImplementation(() => {
      throw new Error('invalid signature');
    });

    auth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ msg: 'Token is not valid' });
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 401 if the token has expired', () => {
    req.header.mockReturnValue('expired_token');
    
    const expiredError = new Error('jwt expired');
    expiredError.name = 'TokenExpiredError';
    
    jwt.verify.mockImplementation(() => {
      throw expiredError;
    });

    auth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ msg: 'Token is not valid' });
    expect(next).not.toHaveBeenCalled();
  });
});