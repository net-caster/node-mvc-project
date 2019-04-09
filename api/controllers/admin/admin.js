const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const User = require('../../models/user');
const Item = require('../../models/item');
const Post = require('../../models/post');
const fileHelper = require('../../utils/file');

const ITEMS_PER_PAGE = 6;

const escapeRegex = (text) => {
	return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
};

exports.getProfile = async (req, res, next) => {
	const id = req.userId;
	try {
		const user = await User.findById(id);
		if (user) {
			res.render('admin/profile', {
				user: user,
				pageTitle: `${user.name}'s Profile`,
				path: '/admin/profile',
				editing: false
			});
		} else {
			res.status(404).json({
				message: 'No valid user ID found!'
			});
		}
	} catch (err) {
		console.log(err);
		res.status(500).json({
			error: err
		});
	}
};

exports.getAllItems = async (req, res, next) => {
	const page = +req.query.page || 1;
	const search = req.query.search;
	let totalItems;
	try {
		if (search) {
			const regex = new RegExp(escapeRegex(search.trim()), 'gi');
			const numItems = await Item.find({
				name: regex
			}).countDocuments();
			totalItems = numItems;
			const items = await Item.find({
				name: regex
			})
				.sort({
					_id: -1
				})
				.skip((page - 1) * ITEMS_PER_PAGE)
				.limit(ITEMS_PER_PAGE);
			// console.log(items);
			res.status(200).render('admin/items', {
				prods: items,
				pageTitle: `Search results for: "${search}"`,
				path: '/admin/items',
				editing: false,
				search: search,
				currentPage: page,
				hasNextPage: ITEMS_PER_PAGE * page < totalItems,
				hasPreviousPage: page > 1,
				nextPage: page + 1,
				previousPage: page - 1,
				lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE)
			});
		} else {
			const numItems = await Item.find().countDocuments();
			totalItems = numItems;
			const items = await Item.find()
				.sort({
					_id: -1
				})
				.skip((page - 1) * ITEMS_PER_PAGE)
				.limit(ITEMS_PER_PAGE);
			// console.log(items);
			res.status(200).render('admin/items', {
				prods: items,
				pageTitle: 'Items',
				path: '/admin/items',
				editing: false,
				search: false,
				currentPage: page,
				hasNextPage: ITEMS_PER_PAGE * page < totalItems,
				hasPreviousPage: page > 1,
				nextPage: page + 1,
				previousPage: page - 1,
				lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE)
			});
		}
	} catch (err) {
		console.log(err);
		res.status(500).json({
			error: err
		});
	}
};

exports.getItem = async (req, res, next) => {
	const id = req.params.itemId;
	try {
		const item = await Item.findById(id);
		// console.log(item);
		if (item) {
			res.status(200).render('admin/details', {
				item: item,
				pageTitle: item.name,
				path: '/admin/items',
				editing: false
			});
		} else {
			res.status(404).json({
				message: 'No valid item ID found!'
			});
		}
	} catch (err) {
		console.log(err);
		res.status(500).json({
			error: err
		});
	}
};

exports.getAddItem = (req, res, next) => {
	res.status(200).render('admin/add-item', {
		pageTitle: 'Add item',
		path: '/admin/add-item',
		editing: false
	});
};

exports.postAddItem = async (req, res, next) => {
	if (!req.file) {
		const error = new Error('No image provided');
		error.statusCode = 422;
		throw error;
	}

	const item = new Item({
		_id: new mongoose.Types.ObjectId(),
		name: req.body.name,
		price: req.body.price,
		description: req.body.description,
		imageUrl: req.file.path
	});

	try {
		const result = await item.save();
		console.log(result);
		res.status(201).redirect('items');
	} catch (err) {
		console.log(err);
		res.status(500).json({
			error: err
		});
	}
};

exports.getUpdateItem = async (req, res, next) => {
	const editMode = req.query.edit;
	const itemId = req.params.itemId;
	try {
		if (editMode !== 'true') {
			return res.redirect('/admin/items');
		}
		const item = await Item.findById(itemId);
		if (!item) {
			return res.redirect('/admin/items');
		}
		res.render('admin/edit-item', {
			pageTitle: `Edit: "${item.name}"`,
			editing: editMode,
			item: item,
			path: '/admin/edit-item'
		});
	} catch (err) {
		err.status = 404;
		console.log(err);
		throw err;
	}
};

exports.postUpdateItem = async (req, res, next) => {
	const itemId = req.params.itemId;
	const updatedName = req.body.name;
	const updatedPrice = req.body.price;
	const imageUrl = req.file;
	const updatedDesc = req.body.description;
	try {
		const item = await Item.findById(itemId);
		item.name = updatedName;
		item.price = updatedPrice;
		item.description = updatedDesc;
		if (imageUrl) {
			fileHelper.deleteFile(item.imageUrl);
			item.imageUrl = imageUrl.path;
		}
		await item.save();
		console.log(item);
		return res.redirect('/admin/items/' + itemId);
	} catch (err) {
		err.status = 500;
		console.log(err);
		throw err;
	}
};

exports.deleteItem = async (req, res, next) => {
	const itemId = req.params.itemId;
	// console.log(itemId);
	try {
		const item = await Item.findById(itemId);
		if (!item) {
			return new Error('Item not found');
		}
		fileHelper.deleteFile(item.imageUrl);
		await Item.deleteOne({
			_id: itemId
		});
		res.status(200).json({
			message: 'Success!'
		});
	} catch (err) {
		console.log(err);
		res.status(500).json({
			error: err
		});
	}
};

exports.getAddPost = (req, res, next) => {
	res.status(200).render('admin/add-post', {
		pageTitle: 'Add Post',
		path: '/admin/add-post',
		editing: false
	});
};

exports.postAddPost = async (req, res, next) => {
	const post = new Post({
		_id: new mongoose.Types.ObjectId(),
		title: req.body.title,
		content: req.body.content
	});
	try {
		const result = await post.save();
		console.log(result);
		res.status(201).redirect('/news');
	} catch (err) {
		console.log(err);
		res.status(500).json({
			error: err
		});
	}
};

exports.getUpdatePost = async (req, res, next) => {
	const editMode = req.query.edit;
	const postId = req.params.postId;
	try {
		if (editMode !== 'true') {
			return res.redirect('/news');
		}
		const post = await Post.findById(postId);
		if (!post) {
			return res.redirect('/news');
		}
		res.render('admin/edit-post', {
			pageTitle: `Edit: "${post.title}"`,
			editing: editMode,
			post: post,
			path: '/admin/edit-post' + postId
		});
	} catch (err) {
		err.status = 404;
		console.log(err);
		throw err;
	}
};

exports.postUpdatePost = async (req, res, next) => {
	const postId = req.params.postId;
	const updatedTitle = req.body.title;
	const updatedCont = req.body.content;
	try {
		const post = await Post.findById(postId);
		post.title = updatedTitle;
		post.content = updatedCont;
		await post.save();
		console.log(post);
		return res.redirect('/news/' + postId);
	} catch (err) {
		err.status = 500;
		console.log(err);
		throw err;
	}
};

exports.deletePost = async (req, res, next) => {
	const postId = req.params.postId;
	// console.log(postId);
	try {
		const post = await Post.findById(postId);
		if (!post) {
			return new Error('Post not found');
		}
		await Post.deleteOne({
			_id: postId
		});
		res.status(200).json({
			message: 'Success!'
		});
	} catch (err) {
		console.log(err);
		res.status(500).json({
			error: err
		});
	}
};

exports.user_getAll = async (req, res, next) => {
	try {
		const users = await User.find().select('email name password _id token');
		const response = {
			count: users.length,
			users: users.map((user) => {
				return {
					email: user.email,
					name: user.name,
					password: user.password,
					_id: user._id,
					token: user.token,
					request: {
						type: 'GET',
						url: 'http://localhost:3000/admin/' + user._id
					}
				};
			})
		};
		console.log(users);
		res.status(200).json(response);
	} catch (err) {
		res.status(500).json({
			error: err
		});
	}
};

exports.user_signup = async (req, res, next) => {
	const user = await User.find({
		email: req.body.email
	});
	if (user.length >= 1) {
		return res.status(409).json({
			message: 'User with that email exists'
		});
	} else {
		bcrypt.hash(req.body.password, 10, async (err, hash) => {
			try {
				if (err) {
					return res.status(500).json({
						error: err
					});
				} else {
					const user = new User({
						_id: new mongoose.Types.ObjectId(),
						email: req.body.email,
						name: req.body.name,
						password: hash
					});

					const result = await user.save();
					console.log(result);
					res.status(201).json({
						message: 'User created successfully'
					});
				}
			} catch (err) {
				console.log(err);
				res.status(500).json({
					error: err
				});
			}
		});
	}
};

exports.user_delete = async (req, res, next) => {
	try {
		const result = User.deleteOne({
			_id: req.params.userId
		});
		res.status(200).json({
			message: 'User deleted'
		});
	} catch (err) {
		console.log(err);
		res.status(500).json({
			error: err
		});
	}
};
