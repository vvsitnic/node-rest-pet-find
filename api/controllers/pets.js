require('dotenv').config();
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

// Create unique image name
const randomImageName = (bytes = 32) =>
  crypto.randomBytes(bytes).toString('hex');

const bucketName = process.env.BUCKET_NAME;
const bucketRegion = process.env.BUCKET_REGION;
const s3 = new S3Client({ region: bucketRegion });

const IMAGE_RESIZE_OPTIONS = [1280, 960, { fit: 'cover' }];

// Get pets in the area
const pets_on_map = async (req, res) => {
  // /pets/on-map?bllat=&bllng=&urlat=&urlng=
  try {
    // Find pets
    const { bllat, bllng, urlat, urlng } = req.query;
    const petDocs = await Pet.find({
      location: {
        $geoWithin: {
          $box: [
            [+bllng, +bllat],
            [+urlng, +urlat],
          ],
        },
      },
    }).exec();

    // Format doc
    const formattedPetDocs = petDocs.map(petDoc => {
      return {
        id: petDoc._id,
        name: petDoc.name,
        long_description: petDoc.long_description,
        short_description: petDoc.short_description,
        last_seen_location: {
          lat: petDoc.location.coordinates[1],
          lng: petDoc.location.coordinates[0],
        },
        date_lost: petDoc.date_lost,
        contacts: {
          email: petDoc.contacts.email,
          phone: petDoc.contacts.phone,
        },
      };
    });

    res.status(200).json(formattedPetDocs);
  } catch (err) {
    res.status(500).json({ message: 'An error occured' });
  }
};

// Get pets that are nearby
const pets_nearby = async (req, res) => {
  // /pets/nearby?lat=&lng=&d=&img=
  try {
    // Find pets
    const { lat, lng, d: distance } = req.query;
    const petDocs = await Pet.find({
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [lng, lat],
          },
          $maxDistance: distance,
        },
      },
    }).exec();

    // Create pet img urls
    const createImageUrls = req.query.img;

    const formattedPetDocs = await Promise.all(
      petDocs.map(async petDoc => {
        let petImageUrl = null;

        // Create img urls if asked
        if (createImageUrls === 'true') {
          const getObjectParams = {
            Bucket: bucketName,
            Key: petDoc.image_key,
          };
          const command = new GetObjectCommand(getObjectParams);
          petImageUrl = await getSignedUrl(s3, command, { expiresIn: 3600 });
        }

        // Format doc
        return {
          id: petDoc._id,
          name: petDoc.name,
          long_description: petDoc.long_description,
          short_description: petDoc.short_description,
          last_seen_location: {
            lat: petDoc.location.coordinates[1],
            lng: petDoc.location.coordinates[0],
          },
          date_lost: petDoc.date_lost,
          contacts: {
            email: petDoc.contacts.email,
            phone: petDoc.contacts.phone,
          },
          image_url: petImageUrl,
        };
      })
    );

    res.status(200).json(formattedPetDocs);
  } catch (err) {
    res.status(500).json({ message: 'An error occured' });
  }
};

// Create new pet
const create_pet = async (req, res) => {
  try {
    // check if user reached limit
    const petDocs = await Pet.find({ user_id: req.userData.id }, 'id').exec();
    if (petDocs.length >= 10)
      return res.status(403).json({ message: 'User reached the limit' });

    // Edit img
    const buffer = await sharp(req.file.buffer)
      .resize(...IMAGE_RESIZE_OPTIONS)
      .toFormat('jpeg')
      .jpeg({
        quality: 75,
        force: true,
      })
      .toBuffer();

    // Create img name
    const imageName = randomImageName();
    // Upload image to S3
    const params = {
      Bucket: bucketName,
      Key: imageName,
      Body: buffer,
      ContentType: req.file.mimetype,
    };
    const command = new PutObjectCommand(params);

    // Create pet doc
    console.log(req.body.petData);
    const petData = JSON.parse(req.body.petData);
    console.log(petData.petName);
    const pet = new Pet({
      _id: new mongoose.Types.ObjectId(),
      user_id: req.userData.id,
      name: petData.name,
      long_description: petData.long_description,
      short_description: petData.short_description,
      image_key: imageName,
      contacts: {
        phone: petData.contacts.phone,
        email: petData.contacts.email,
      },
      location: {
        type: 'Point',
        coordinates: [petData.coords.lng, petData.coords.lat],
      },
      date_lost: petData.date_lost,
    });
    const result = await pet.save();

    // Upload img to S3
    await s3.send(command);

    res.status(201).json({ id: result.id });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'An error occured' });
  }
};

// Get pet
const get_pet = async (req, res) => {
  // /pets/:id?img=false
  try {
    // Get pet from db
    const id = req.params.id;
    const petDoc = await Pet.findById(id);

    // Check if pet exists
    if (!petDoc) return res.status(404).json({ message: 'Pet does not exist' });

    // Create pet img url
    const createImageUrl = req.query.img;
    let petImageUrl = null;

    if (createImageUrl === 'true') {
      const getObjectParams = {
        Bucket: bucketName,
        Key: petDoc.image_key,
      };
      const command = new GetObjectCommand(getObjectParams);
      petImageUrl = await getSignedUrl(s3, command, { expiresIn: 3600 });
    }

    // Format doc
    const formattedPetDoc = {
      id: petDoc._id,
      name: petDoc.name,
      long_description: petDoc.long_description,
      short_description: petDoc.short_description,
      last_seen_location: {
        lat: petDoc.location.coordinates[1],
        lng: petDoc.location.coordinates[0],
      },
      date_lost: petDoc.date_lost,
      contacts: { email: petDoc.contacts.email, phone: petDoc.contacts.phone },
      image_url: petImageUrl,
    };

    res.status(200).json(formattedPetDoc);
  } catch (err) {
    res.status(500).json({ message: 'An error occured' });
  }
};

// Get pets of user
const get_pets_of_user = async (req, res, next) => {
  // /pets-of-user/:id?img=
  try {
    // Find docs
    const petDocs = await Pet.find({ user_id: req.userData.id }).exec();

    // Create pet img urls
    const createImageUrls = req.query.img;

    // Format docs
    const formattedPetDocs = await Promise.all(
      petDocs.map(async petDoc => {
        let petImageUrl = null;

        // Create img urls if asked
        if (createImageUrls === 'true') {
          const getObjectParams = {
            Bucket: bucketName,
            Key: petDoc.image_key,
          };
          const command = new GetObjectCommand(getObjectParams);
          petImageUrl = await getSignedUrl(s3, command, { expiresIn: 3600 });
        }

        // Format doc
        return {
          id: petDoc._id,
          name: petDoc.name,
          long_description: petDoc.long_description,
          short_description: petDoc.short_description,
          last_seen_location: {
            lat: petDoc.location.coordinates[1],
            lng: petDoc.location.coordinates[0],
          },
          date_lost: petDoc.date_lost,
          contacts: {
            email: petDoc.contacts.email,
            phone: petDoc.contacts.phone,
          },
          image_url: petImageUrl,
        };
      })
    );

    res.status(200).json(formattedPetDocs);
  } catch (err) {
    res.status(500).json({ message: 'An error occured' });
  }
};

// Edit pet
const update_pet = async (req, res) => {
  try {
    // Which doc to update
    const filter = {
      _id: req.params.id,
      user_id: req.userData.id,
    };

    const petDoc = await Pet.findOne(filter, 'image_key');

    // Check if pet exists and is created by the user
    if (!petDoc) return res.status(404).json({ message: 'Pet not found' });

    // If img name remains null, the image_key won't change
    let newImageKey = null;
    if (req.file && req.file.buffer) {
      newImageKey = randomImageName();
    }

    const petData = JSON.parse(req.body.petData);
    // What to update
    const update = {
      pet_name: petData.pet_name,
      long_description: petData.long_description,
      short_description: petData.short_description,
      image_key: newImageKey || petDoc.image_key,
      'contacts.phone': petData.contacts.phone,
      'contacts.email': petData.contacts.email,
      'location.coordinates': [petData.coords.lng, petData.coords.lat],
      date_lost: petData.date_lost,
    };

    // Update pet
    await Pet.updateOne(filter, update).exec();

    if (req.file && req.file.buffer) {
      // Delete prev img
      const deleteImgParams = {
        Bucket: bucketName,
        Key: petDoc.petImage,
      };
      const deleteImgCommand = new DeleteObjectCommand(deleteImgParams);
      await s3.send(deleteImgCommand);

      // Create new img
      const buffer = await sharp(req.file.buffer)
        .resize(...IMAGE_RESIZE_OPTIONS)
        .toBuffer();

      const createImgParams = {
        Bucket: bucketName,
        Key: newImageKey,
        Body: buffer,
        ContentType: req.file.mimetype,
      };

      const createImgCommand = new PutObjectCommand(createImgParams);
      await s3.send(createImgCommand);
    }

    res.status(200).json({ message: 'Doc updated successfully' });
  } catch (err) {
    res.status(500).json({ message: 'An error occured' });
  }
};

// Delete pet
const delete_pet = async (req, res) => {
  // Delete pet
  try {
    const params = {
      Bucket: bucketName,
      Key: petDoc.petImage,
    };
    const command = new DeleteObjectCommand(params);
    await s3.send(command);

    // Delete pet
    await Pet.deleteOne({
      _id: req.params.id,
      user_id: req.userData.id,
    }).exec();

    res.status(200).json({ message: 'Pet deleted' });
  } catch (err) {
    res.status(500).json({ message: 'An error occured' });
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
