// Set user info to be sent back to client
exports.setUserInfoForResponse = user => {
  return {
    _id: user._id,
    firstName: user.profile.firstName,
    lastName: user.profile.lastName,
    username: user.username,
    role: user.role,
    joined: user.createdAt,
    cash: user.cash,
    cashAdded: user.cashAdded,
    updatedAt: user.updatedAt
  };
};
