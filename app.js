const express = require('express');
const app = express();
const morgan = require('morgan');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const path = require('path');
const multer = require('multer');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const helmet = require('helmet');
const compression = require('compression');

const itemsRoutes = require('./api/routes/items');
const adminRoutes = require('./api/routes/admin/admin');
const pagesRoutes = require('./api/routes/pages');
// const orderRoutes = require('./api/routes/orders');

app.set('view engine', 'ejs');
app.set('views', 'api/views');

mongoose.connect(
	`mongodb+srv://${process.env.MONGO_ATLAS_USER}:${process.env
		.MONGO_ATLAS_PW}@database-gaxrl.mongodb.net/test?retryWrites=true`,
	{ useNewUrlParser: true }
);

app.use(morgan('dev'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(helmet());
app.use(compression());

const storage = multer.diskStorage({
	destination: function(req, file, callback) {
		callback(null, 'uploads');
	},
	filename: function(req, file, callback) {
		callback(null, new Date().toISOString().replace(/:/g, '-') + file.originalname);
	}
});

const fileFilter = (req, file, callback) => {
	if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/jpg' || file.mimetype === 'image/png') {
		callback(null, true);
	} else {
		callback(null, false);
	}
};

const upload = multer({
	storage: storage,
	limits: {
		fileSize: 1024 * 1024 * 5
	},
	fileFilter: fileFilter
});

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.static(path.join(__dirname, 'api/public')));
app.use(upload.single('imageUrl'));

app.use((req, res, next) => {
	res.header('Access-Control-Allow-Origin', '*');
	res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
	if (req.method === 'OPTIONS') {
		res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
		return res.status(200).json({});
	}
	next();
});

app.use((req, res, next) => {
	app.locals.isAuth = false;
	const currentTime = new Date().getTime() / 1000;
	if (req.cookies.access_token && currentTime < jwt.decode(req.cookies.access_token).exp) {
		app.locals.isAuth = true;
	}
	next();
});

app.use('/admin', adminRoutes);
app.use(itemsRoutes);
app.use(pagesRoutes);

app.use((req, res, next) => {
	res.status(404).render('404', {
		pageTitle: 'Page Not Found!',
		path: '/404'
	});
});

app.use((error, req, res, next) => {
	res.status(error.status || 500).render('500', {
		pageTitle: 'Server Error!',
		path: '/500'
	});
});

module.exports = app;
