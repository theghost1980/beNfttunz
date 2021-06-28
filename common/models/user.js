const mongoose = require('mongoose');
const noAvatarYet = { 
  avatar: 'https://res.cloudinary.com/dbrejj0aq/image/upload/v1624879141/site/images/noAvatarYet_aivi6i.png',
  thumb: 'https://res.cloudinary.com/dbrejj0aq/image/upload/v1624879141/site/images/noAvatarYet-thumb_gdwps0.png',
};

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    index: true,
    required: true,
    unique: true,
  },
  full_name: {
    type: String,
    trim: true,
  },
  bio: {
    type: String,
    trim: true,
  },
  location: {
    type: String,
    trim: true,
  },
  website: {
    type: String,
    trim: true,
  },
  instagram: {
    type: String,
    trim: true,
  },
  twitter: {
    type: String,
    trim: true,
  },
  portfolio: {
    type: String,
    trim: true,
  },
  soundcloud: {
    type: String,
    trim: true,
  },
  avatar: {
        type: String,
        default: noAvatarYet.avatar,
  },
  thumb: {
    type: String,
    default: noAvatarYet.thumb, 
  },
  banned: {
    type: Boolean,
    default: false,
  },
  ban_reason: String,
  whitelisted: {
    type: Boolean,
    default: false,
  },
  whitelist_applied: {
    type: Boolean,
    default: false,
  },
  following: {
    type: Array,
  },
  referred_by: {
    type: String,
    minlength: 3,
    maxlength: 16,
    index: true,
    default: null,
  },
  foldersCDN: {
    type: Boolean,
    default: false,
  },
  createdAt: Date,
  updatedAt: Date,
});

module.exports = mongoose.model('User', UserSchema);