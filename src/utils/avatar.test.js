import { getAvatarUrl } from './avatar';

describe('getAvatarUrl', () => {
  const DEFAULT_AVATAR_URL = process.env.REACT_APP_AVATAR_URL;

  beforeEach(() => {
    // Set up environment variable for testing
    process.env.REACT_APP_AVATAR_URL = 'https://example.com/default-avatar.png';
  });

  afterEach(() => {
    delete process.env.REACT_APP_AVATAR_URL;
  });

  it('returns default avatar when profile is null or undefined', () => {
    expect(getAvatarUrl(null)).toBe(DEFAULT_AVATAR_URL);
    expect(getAvatarUrl(undefined)).toBe(DEFAULT_AVATAR_URL);
  });

  it('returns avatar URL when profile.avatar is an HTTP URL', () => {
    const profile = {
      avatar: 'https://cloudinary.com/avatar123.jpg'
    };

    expect(getAvatarUrl(profile)).toBe('https://cloudinary.com/avatar123.jpg');
  });

  it('returns avatarUrl when profile.avatarUrl is an HTTP URL', () => {
    const profile = {
      avatarUrl: 'https://example.com/avatar456.png'
    };

    expect(getAvatarUrl(profile)).toBe('https://example.com/avatar456.png');
  });

  it('prioritizes avatar over avatarUrl', () => {
    const profile = {
      avatar: 'https://cloudinary.com/avatar123.jpg',
      avatarUrl: 'https://example.com/avatar456.png'
    };

    expect(getAvatarUrl(profile)).toBe('https://cloudinary.com/avatar123.jpg');
  });

  it('returns default avatar when avatar is not an HTTP URL', () => {
    const profile = {
      avatar: 'local-avatar.png' // Not an HTTP URL
    };

    expect(getAvatarUrl(profile)).toBe(DEFAULT_AVATAR_URL);
  });

  it('returns default avatar when avatarUrl is not an HTTP URL', () => {
    const profile = {
      avatarUrl: 'relative/path/avatar.png' // Not an HTTP URL
    };

    expect(getAvatarUrl(profile)).toBe(DEFAULT_AVATAR_URL);
  });

  it('handles empty avatar strings', () => {
    const profile = {
      avatar: '',
      avatarUrl: 'https://example.com/avatar.png'
    };

    expect(getAvatarUrl(profile)).toBe('https://example.com/avatar.png');
  });

  it('handles profile with no avatar properties', () => {
    const profile = {
      username: 'testuser',
      email: 'test@example.com'
    };

    expect(getAvatarUrl(profile)).toBe(DEFAULT_AVATAR_URL);
  });
});