'use strict';

const request = require('request');
let Note = require('../models/Note.js');
let Article = require('../models/Article.js');
let path = require('path');
let https = require('https');

let scrapedArticles = [];
let existingArticles = [];
let newArticles = [];
let articleMatch = false;

// bing search variables
let subscriptionKey = 'cad73a52159b47058393c71141f5771d';
let host = 'api.cognitive.microsoft.com';

module.exports = function (app) {

	app.get('/images/:term/:offset', function(req, res) {
		let searchPath = '/bing/v7.0/images/search';
		searchPath += '?q=' + encodeURIComponent(req.params.term);
		searchPath += '&count=' + encodeURIComponent('25');
		searchPath += '&offset=' + encodeURIComponent(req.params.offset);
		searchPath += '&aspect=' + encodeURIComponent('Wide');
		searchPath += '&imageType=' + encodeURIComponent('Photo');
		searchPath += '&license=' + encodeURIComponent('ShareCommercially');
		searchPath += '&minHeight=' + encodeURIComponent('720');
		console.log(host + searchPath);

		let params = {
			method : 'GET',
			hostname : host,
			path : searchPath,
			headers : {
					'Ocp-Apim-Subscription-Key' : subscriptionKey,
			}
		};

		let request = https.request(params, function(response) {
			let body = '';
			response.on('data', function (d) {
				body += d;
			});

			response.on('end', function () {
				console.log('\nRelevant Headers:\n');
				for (var header in response.headers)
						// header keys are lower-cased by Node.js
						if (header.startsWith("bingapis-") || header.startsWith("x-msedge-"))
								console.log(header + ": " + response.headers[header]);
				body = JSON.stringify(JSON.parse(body), null, '  ');
				// console.log('\nJSON Response:\n');
				// console.log(body);
				res.json(body);
			});

			response.on('error', function (e) {
					console.log('Error: ' + e.message);
			});
		});

		request.end();
	});

	// bing response handler
	let response_handler = function (response) {
		// let body = '';
		// response.on('data', function (d) {
		// 		body += d;
		// });

	};

	let bing_image_search = function (search) {
	console.log('Searching images for: ' + search);
	let request_params = {
				method : 'GET',
				hostname : host,
				path : searchPath + '?q=' + encodeURIComponent(search),
				headers : {
						'Ocp-Apim-Subscription-Key' : subscriptionKey,
				}
		};

	}

	// get route to return all articles in the database
	app.get("/all", function (req, res) {
		Article.find({}, function (error, data) {
			if (error) {
				console.log(error);
			} else {
				console.log(data);
				res.json(data);
			}
		});
	});

	// post route delete an article from the database
	// receives req.body.title and uses that to compare with existing articles
	app.post("/delete", function (req, res) {
		Article.findOneAndRemove({ headline: req.body.headline }, function (error, data) {
			if (error) {
				console.log(error);
			} else res.json(data);
		});
	})

	// post route to delete a note from the database
	app.post("/note/delete/:id", function (req, res) {
		Note.findOneAndRemove({ _id: req.params.id }, function (error, data) {
			if (error) {
				console.log(error);
			} else {
				// then find the associate article from the req.params.id
				Article.update({ _id: req.body.articleID }, { $pull: { "notes": req.params.id } }).exec(function (error, data) {
					res.json(data);
				});
			}
		});
	});

	app.get("/notes/:id", function (req, res) {
		Article.find({ _id: req.params.id })
			.populate("notes")
			.exec(function (error, data) {

				if (!data[0].notes) {
					res.send(null);
				} else {
					res.json(data);
				}
			});
	});

	// post route to add a new note to the database
	app.post("/note/:id", function (req, res) {
		let newNote = Note(req.body);
		newNote.save(req.body, function (error, doc) {
			// then find the associate article from the req.params.id
			Article.findOneAndUpdate({ _id: req.params.id }, { $push: { "notes": doc._id } }).exec(function (error, data) {
				res.json(data);
			});
		});
	});

	app.post("/save", function (req, res) {

		let newArticle = Article({
			headline: req.body.headline,
			date: req.body.date,
			url: req.body.url
		});

		newArticle.save(function (error, data) {
			if (error) {
				console.log(error);
			}
			console.log("data: " + data);
			res.json(data);
		});
	});

	app.get("*", function (req, res) {
		res.sendFile(path.join(__dirname, "../client/build/index.html"));
	});
}