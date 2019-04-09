const Item = require('../models/item');

const ITEMS_PER_PAGE = 6;

const escapeRegex = (text) => {
	return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
};

exports.items_getAll = async (req, res, next) => {
	const page = +req.query.page || 1;
	const search = req.query.search;
	let totalItems;
	try {
		if (search) {
			const regex = new RegExp(escapeRegex(search.trim()), 'gi');
			const numItems = await Item.find({ name: regex }).countDocuments();
			totalItems = numItems;
			console.log(totalItems);
			const items = await Item.find({ name: regex })
				.sort({ _id: -1 })
				.skip((page - 1) * ITEMS_PER_PAGE)
				.limit(ITEMS_PER_PAGE);
			// console.log(items);
			res.status(200).render('items', {
				prods: items,
				pageTitle: `Search results for: "${search}"`,
				path: '/items',
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
			console.log(totalItems);
			const items = await Item.find({}).sort({ _id: -1 }).skip((page - 1) * ITEMS_PER_PAGE).limit(ITEMS_PER_PAGE);
			// console.log(items);
			res.status(200).render('items', {
				prods: items,
				pageTitle: "Items | Jimmy's Garage",
				path: '/items',
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
		const error = new Error(err);
		error.httpStatusCode = 500;
		console.log(error);
		return next(error);
	}
};

exports.items_getItem = async (req, res, next) => {
	const id = req.params.itemId;
	// console.log(id);
	try {
		const item = await Item.findById(id);
		// console.log(item);
		if (item) {
			res.status(200).render('details', {
				item: item,
				pageTitle: item.name + " | Jimmy's Garage",
				path: '/items'
			});
		} else {
			res.status(404).json({
				message: 'No valid item ID found!'
			});
		}
	} catch (err) {
		console.log(err);
		res.status(500).json({ error: err });
	}
};
