// MJS 4.18.24 from starter code. Routes /api/users
// import user model
const { User } = require('../models');
// import sign token function from auth
const { signToken } = require('../utils/auth');

module.exports = {
  async getOptions({ user = null, params }, res) {
    const foundUser = {options: "All routes begin with api/users. login: Other routes auth protected. ", 
                        authRoutes: "/ POST or PUT book. DEL books/:bookid. /me getSingleUser loggedIn"
                      };
    if (!foundUser) {
      return res.status(400).json({ message: 'getOptions foundUser json obj not valid.' });
    }
    res.json(foundUser);
  }, // end getOptions

  // get a single user by either their id or their username
  async getSingleUser({ user = null, params }, res) {
    const foundUser = await User.findOne({
      $or: [{ _id: user ? user._id : params.id }, { username: params.username }],
    });
    if (!foundUser) {
      return res.status(400).json({ message: 'Cannot find a user with this id!' });
    }
    res.json(foundUser);
  }, // end getSingleUser

  // create a user, sign a token, and send it back (to client/src/components/SignUpForm.js)
  async createUser({ body }, res) {
    const user = await User.create(body);
    if (!user) {
      return res.status(400).json({ message: 'Something is wrong!' });
    }
    const token = signToken(user);
    res.json({ token, user });
  }, // end createUser

  // login a user, sign a token, and send it back (to client/src/components/LoginForm.js)
  // {body} is destructured req.body
  async login({ body }, res) {
    const user = await User.findOne({ $or: [{ username: body.username }, { email: body.email }] });
    if (!user) {
      return res.status(400).json({ message: "Can't find this user" });
    }
    const correctPw = await user.isCorrectPassword(body.password);
    if (!correctPw) {
      return res.status(400).json({ message: 'Wrong password!' });
    }
    const token = signToken(user);
    res.json({ token, user });
  }, // end login

  // save a book to a user's `savedBooks` field by adding it to the set (to prevent duplicates)
  // user comes from `req.user` created in the auth middleware function
  async saveBook({ user, body }, res) {
    console.log(user);
    try {
      const updatedUser = await User.findOneAndUpdate(
        { _id: user._id },
        { $addToSet: { savedBooks: body } },
        { new: true, runValidators: true }
      );
      return res.json(updatedUser);
    } catch (err) {
      console.log(err);
      return res.status(400).json(err);
    }
  },

  // remove a book from `savedBooks`
  async deleteBook({ user, params }, res) {
    const updatedUser = await User.findOneAndUpdate(
      { _id: user._id },
      { $pull: { savedBooks: { bookId: params.bookId } } },
      { new: true }
    );
    if (!updatedUser) {
      return res.status(404).json({ message: "Couldn't find user with this id!" });
    }
    return res.json(updatedUser);
  },  // end DeleteBook
};
