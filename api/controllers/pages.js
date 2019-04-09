const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const User = require('../models/user');
const Item = require('../models/item');
const Post = require('../models/post');

const POSTS_PER_PAGE = 10;

exports.getIndex = async (req, res, next) => {
	try {
		const posts = await Post.find();
		const items = await Item.find();
		res.status(200).render('index', {
			pageTitle: "Welcome to Jimmy's Garage!",
			items: items.slice(-3).reverse(),
			posts: posts.slice(-3).reverse(),
			path: '/'
		});
		// console.log(items.slice(-1));
	} catch (err) {
		throw err;
	}
};

exports.getAbout = (req, res, next) => {
	res.status(200).render('about', {
		pageTitle: "About | Jimmy's Garage",
		path: '/about'
	});
};

exports.getContact = (req, res, next) => {
	res.status(200).render('contact', {
		pageTitle: "Contact Us | Jimmy's Garage",
		path: '/contact'
	});
};

exports.getNews = async (req, res, next) => {
	const page = +req.query.page || 1;
	let totalPosts;
	try {
		const numPosts = await Post.find().countDocuments();
		totalPosts = numPosts;
		const posts = await Post.find().sort({ _id: -1 }).skip((page - 1) * POSTS_PER_PAGE).limit(POSTS_PER_PAGE);
		res.status(200).render('news', {
			pageTitle: "News | Jimmy's Garage",
			posts: posts,
			path: '/news',
			search: false,
			currentPage: page,
			hasNextPage: POSTS_PER_PAGE * page < totalPosts,
			hasPreviousPage: page > 1,
			nextPage: page + 1,
			previousPage: page - 1,
			lastPage: Math.ceil(totalPosts / POSTS_PER_PAGE)
		});
		// console.log(posts);
	} catch (err) {
		const error = new Error(err);
		console.log(error);
		return next(error);
	}
};

exports.getPost = async (req, res, next) => {
	const postId = req.params.postId;
	// console.log(postId);
	try {
		const post = await Post.findById(postId);
		// console.log(post);
		if (post) {
			res.status(200).render('post', {
				post: post,
				pageTitle: post.title + " | Jimmy's Garage",
				path: '/news'
			});
		} else {
			res.status(404).json({
				message: 'No valid post ID found!'
			});
		}
	} catch (err) {
		console.log(err);
		res.status(500).json({ error: err });
	}
};

exports.getLogin = (req, res, next) => {
	res.status(200).render('login', {
		pageTitle: 'Login',
		path: '/login',
		errorMessage: null,
		oldInput: {
			email: '',
			password: ''
		}
	});
};

exports.getLogout = (req, res, next) => {
	res.clearCookie('access_token');
	res.clearCookie('user');
	res.redirect('/');
};

exports.postLogin = async (req, res, next) => {
	const email = req.body.email;
	const password = req.body.password;

	try {
		const user = await User.findOne({ email: email });
		if (!user) {
			return res.status(401).render('login', {
				pageTitle: 'Login',
				path: '/login',
				errorMessage: 'No such user found!',
				oldInput: {
					email: email,
					password: ''
				}
			});
		}
		bcrypt.compare(password, user.password, (err, result) => {
			if (err) {
				console.log(err);
				return res.status(422).redirect('/login');
			}
			if (result) {
				const token = jwt.sign(
					{
						email: user.email,
						userId: user._id
					},
					process.env.JWT_KEY,
					{
						expiresIn: '1h'
					}
				);
				res.cookie('access_token', token, {
					httpOnly: true
				});
				res.cookie('user', user, {
					httpOnly: true
				});
				console.log(token);
				return res.status(200).redirect('admin/profile');
			}
			return res.status(422).render('login', {
				path: '/login',
				pageTitle: 'Login',
				errorMessage: 'Wrong Password! Please try again.',
				oldInput: {
					email: email,
					password: ''
				}
			});
		});
	} catch (err) {
		console.log(err);
		res.status(500).json({
			error: err
		});
	}
};
