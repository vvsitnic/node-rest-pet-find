const mongoose = require('mongoose');
const Pet = require('../models/pet.js');
const crypto = require('node:crypto');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const {
	S3Client,
	PutObjectCommand,
	GetObjectCommand,
	DeleteObjectCommand,
} = require('@aws-sdk/client-s3');
const sharp = require('sharp');

require('dotenv').config();
const randomImageName = (bytes = 32) =>
	crypto.randomBytes(bytes).toString('hex');

const bucketName = process.env.BUCKET_NAME;
const bucketRegion = process.env.BUCKET_REGION;

const s3 = new S3Client({ region: bucketRegion });

const pets_on_map = async (req, res, next) => {
	// Get pets in the area
	// localhost:3000/pets/on-map?n=&e=&s=&w=&f=
	// TODO: change names of variables
	try {
		const { n, e, s, w } = req.query;
		const filter = req.query.f || '';

		const petDocs = await Pet.find(
			{
				location: {
					$geoWithin: {
						$box: [
							[+e, +n],
							[+w, +s],
						],
					},
				},
			},
			filter
		).exec();

		if (petDocs.length !== 0 && petDocs[0].petImage) {
			for (const petDoc of petDocs) {
				const getObjectParams = {
					Bucket: bucketName,
					Key: petDoc.petImage,
				};
				const command = new GetObjectCommand(getObjectParams);
				const url = await getSignedUrl(s3, command, {
					expiresIn: 3600,
				});
				petDoc.petImageUrl = url;
			}
		}

		res.status(200).json(petDocs);
	} catch (err) {
		next(err);
	}
};

const pets_nearby = async (req, res, next) => {
	// Get pets that are nearby
	// localhost:3000/pets/nearby?lat=&lng=&d=&f=
	try {
		const { lat, lng, d: distance } = req.query;
		const filter = req.query.f || '';

		const petDocs = await Pet.find(
			{
				location: {
					$near: {
						$geometry: {
							type: 'Point',
							coordinates: [lng, lat],
						},
						$maxDistance: distance,
					},
				},
			},
			filter
		).exec();

		if (petDocs.length !== 0 && petDocs[0].petImage) {
			for (const petDoc of petDocs) {
				const getObjectParams = {
					Bucket: bucketName,
					Key: petDoc.petImage,
				};
				const command = new GetObjectCommand(getObjectParams);
				const url = await getSignedUrl(s3, command, {
					expiresIn: 3600,
				});
				petDoc.petImageUrl = url;
			}
		}

		res.status(200).json(petDocs);
	} catch (err) {
		next(err);
	}
};

const create_pet = async (req, res, next) => {
	// Create new pet
	try {
		// Edit img
		const buffer = await sharp(req.file.buffer)
			.resize(1920, 1080, { fit: 'cover' })
			.toBuffer();

		// Upload img
		const imageName = randomImageName();
		const params = {
			Bucket: bucketName,
			Key: imageName,
			Body: buffer,
			ContentType: req.file.mimetype,
		};

		const command = new PutObjectCommand(params);
		await s3.send(command);

		// Create pet doc
		const petData = JSON.parse(req.body.petData);
		const pet = new Pet({
			_id: new mongoose.Types.ObjectId(),
			userId: req.userData.id,
			petName: petData.petName,
			description: petData.description,
			details: petData.details,
			petImage: imageName,
			contacts: {
				phone: petData.contacts.phone,
				email: petData.contacts.email,
			},
			location: {
				type: 'Point',
				coordinates: [petData.coords.lng, petData.coords.lat],
			},
			dateLost: petData.dateLost,
			reward: petData.reward,
		});
		const result = await pet.save();

		res.status(201).json({ id: result.id });
	} catch (err) {
		next(err);
	}
};

const get_pet = async (req, res, next) => {
	// Get pet
	// localhost:3000/pets/:id?f=
	try {
		const id = req.params.id;
		const filter = req.query.f || '';
		const petDoc = await Pet.findById(id, filter);

		if (!petDoc) return res.status(403).json({ message: 'Not found' });

		if (petDoc.petImage) {
			const getObjectParams = {
				Bucket: bucketName,
				Key: petDoc.petImage,
			};
			const command = new GetObjectCommand(getObjectParams);
			const url = await getSignedUrl(s3, command, { expiresIn: 3600 });
			petDoc.petImageUrl = url;
		}

		res.status(200).json(petDoc);
	} catch (err) {
		next(err);
	}
};

const get_pets_of_user = async (req, res, next) => {
	// Get pets of user
	// localhost:3000/pets-of-user/:id?f=
	try {
		// Check if user is the one
		if (req.params.id !== req.userData.id)
			return res.status(403).json({ message: 'Not found' });

		// Find docs
		const filter = req.query.f || '';
		const petDocs = await Pet.find(
			{ userId: req.params.id },
			filter
		).exec();

		// Check if img urls are needed
		// Create img urls for each doc
		if (petDocs.length !== 0 && petDocs[0].petImage) {
			for (const petDoc of petDocs) {
				const getObjectParams = {
					Bucket: bucketName,
					Key: petDoc.petImage,
				};
				const command = new GetObjectCommand(getObjectParams);
				const url = await getSignedUrl(s3, command, {
					expiresIn: 3600,
				});
				petDoc.petImageUrl = url;
			}
		}

		res.status(200).json(petDocs);
	} catch (err) {
		next(err);
	}
};

const update_pet = async (req, res, next) => {
	// Edit pet data
	try {
		// Check if pet exists and is created by the user
		const petId = req.params.id;
		const petDoc = await Pet.findOne(
			{
				_id: petId,
				userId: req.userData.id,
			},
			'petImage'
		);

		if (!petDoc) return res.status(403).json({ message: 'Pet not found' });

		// Delete prev img
		const deleteImgParams = {
			Bucket: bucketName,
			Key: petDoc.petImage,
		};
		const deleteImgCommand = new DeleteObjectCommand(deleteImgParams);
		await s3.send(deleteImgCommand);

		// Create new img
		const buffer = await sharp(req.file.buffer)
			.resize(1920, 1080, { fit: 'cover' })
			.toBuffer();

		const imageName = randomImageName();
		const createImgParams = {
			Bucket: bucketName,
			Key: imageName,
			Body: buffer,
			ContentType: req.file.mimetype,
		};

		const createImgCommand = new PutObjectCommand(createImgParams);
		await s3.send(createImgCommand);

		// Update pet
		const update = {
			petName: petData.petName,
			description: petData.description,
			details: petData.details,
			petImage: imageName,
			'contacts.phone': petData.contacts.phone,
			'contacts.email': petData.contacts.email,
			'location.coordinates': [petData.coords.lng, petData.coords.lat],
			dateLost: petData.dateLost,
			reward: petData.reward,
		};

		// Update pet
		await Pet.updateOne({ _id: petId }, update).exec();

		res.status(200).json({});
	} catch (err) {
		next(err);
	}
};

const delete_pet = async (req, res, next) => {
	// Delete pet
	try {
		// Check if pet exists and is created by the user
		const petId = req.params.id;
		const petDoc = await Pet.findOne(
			{
				_id: petId,
				userId: req.userData.id,
			},
			'petImage'
		);

		if (!petDoc) return res.status(403).json({ message: 'Pet not found' });

		// Delete pet's img
		const params = {
			Bucket: bucketName,
			Key: petDoc.petImage,
		};
		const command = new DeleteObjectCommand(params);
		await s3.send(command);

		// Delete pet
		await Pet.deleteOne({ _id: petId }).exec();

		res.status(200).json({ message: 'Pet deleted' });
	} catch (err) {
		next(err);
	}
};

module.exports = {
	pets_on_map,
	pets_nearby,
	create_pet,
	get_pet,
	delete_pet,
	get_pets_of_user,
	update_pet,
};
