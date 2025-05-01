import ProductType from "./models/productType.js";
import Universe from './models/universe.js';

import Status from "./models/status.js";
import User from "./models/user.js";
import Transaction from "./models/transaction.js";
import Condition from "./models/condition.js";
import Brand from "./models/brand.js";
import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import Advert from "./models/advert.js";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;


async function initUsers() {
  console.log("Creando usuarios...");

  // Opcional: borrar usuarios previos
  // await User.deleteMany({});

  const usersData = Array.from({ length: 1 }).map((_, i) => ({
    username: `usuariooyo${i + 3}`,
    email: `userryr${i + 3}@mail.com`,
    passwordHash: "", // se rellena más abajo
    firstName: `Nombre${i + 1}`,
    lastName: `Apellido${i + 1}`,
    phone: `60000000${i}`,
    location: "Madrid",
    avatarUrl: "", // puedes dejarlo vacío o poner una imagen por defecto
    bio: `Soy el usuario ${i + 1}`,
    isAdmin: i === 0, // solo el primero es admin
  }));

  // Hash de contraseñas
  for (const user of usersData) {
    user.passwordHash = await bcrypt.hash("123456", 10); // misma clave para todos
  }

  // const createdUsers = await User.insertMany(usersData);
  //console.log(`${createdUsers.length} usuarios creados.`);
}

async function initAdverts() {
  console.log("Creando anuncios...");

  // Primero recuperamos los usuarios creados
  const users = await User.find({});

  // Recuperamos las referencias necesarias

  await Advert.deleteMany()
   
       const transactions= await Transaction.find()
       const statuses= await Status.find()
        const types = await ProductType.find()
       const universes = await Universe.find()
        const conditions = await Condition.find()
       const brands = await  Brand.find()

      console.log({ transactions, statuses, types, universes, conditions, brands });



  // URLs de ejemplo para imágenes
  const imageMap = {
    "Estatuas y réplicas": {
      "Dragon Ball": [
        "https://res.cloudinary.com/ds6adqnyz/image/upload/v1745309953/adverts/67fbab80b3466997a0e773ab/x0jnyuumhsstjwjapjzy.avif",
        "https://res.cloudinary.com/ds6adqnyz/image/upload/v1745309953/adverts/67fbab80b3466997a0e773ab/az9vuse5hmbfteaoqsbb.jpg",
        "https://res.cloudinary.com/ds6adqnyz/image/upload/v1745309955/adverts/67fbab80b3466997a0e773ab/t3xjprxc1ewap4eacizm.png",
        "https://res.cloudinary.com/ds6adqnyz/image/upload/v1745309956/adverts/67fbab80b3466997a0e773ab/khftwt6zdmm8sdi8tbd8.webp",
      ],

      "Star Wars": [
        "https://res.cloudinary.com/ds6adqnyz/image/upload/v1745320223/m7r7nhdyjpgygklblttq.jpg",
        "https://res.cloudinary.com/ds6adqnyz/image/upload/v1745319992/bdrlci4yzzkjulr7t90x.jpg",
        "https://res.cloudinary.com/ds6adqnyz/image/upload/v1745319983/krpcox6kkwsim0bn0ozq.jpg",
        "https://res.cloudinary.com/ds6adqnyz/image/upload/v1745319967/lvdszzinhruhkkbvwuys.jpg",
        "https://res.cloudinary.com/ds6adqnyz/image/upload/v1745319967/lvdszzinhruhkkbvwuys.jpg",
      ],
      "Disney": [
        "https://res.cloudinary.com/ds6adqnyz/image/upload/v1745322325/dcxbzroiwnme4bmuuhou.jpg",
        "https://res.cloudinary.com/ds6adqnyz/image/upload/v1745322313/daspsvgollklqog9vxbc.jpg",
        "https://res.cloudinary.com/ds6adqnyz/image/upload/v1745322303/dz78flzlwednz6ill8of.jpg",
        "https://res.cloudinary.com/ds6adqnyz/image/upload/v1745322296/enzhz7rmtjx3ppjwnhxo.jpg",
        "https://res.cloudinary.com/ds6adqnyz/image/upload/v1745322287/fnjkvq2zgsy4gqlvvndi.jpg",
      ],
      "Marvel": [
        "https://res.cloudinary.com/ds6adqnyz/image/upload/v1745322477/wqwuukoa1apvhychnspo.jpg",
        "https://res.cloudinary.com/ds6adqnyz/image/upload/v1745322565/t6oqbmay4zsqf1y6iwv2.jpg",
        "https://res.cloudinary.com/ds6adqnyz/image/upload/v1745322473/scxneqbjm6oluhc0htgg.jpg",
        "https://res.cloudinary.com/ds6adqnyz/image/upload/v1745322457/dikergbonrnbgrmb1hgz.jpg",
        "https://res.cloudinary.com/ds6adqnyz/image/upload/v1745322458/z85mwlihu3f84swvgt0h.jpg",
      ],
      "Harry Potter": [
        "https://res.cloudinary.com/ds6adqnyz/image/upload/v1745322700/czqmeczcznnakx5jvbmy.jpg",
        "https://res.cloudinary.com/ds6adqnyz/image/upload/v1745322707/tbaokzp2rhng8aeseufa.webp",
        "https://res.cloudinary.com/ds6adqnyz/image/upload/v1745322722/f1jpr3dbwbj9iujpqswo.jpg",
        "https://res.cloudinary.com/ds6adqnyz/image/upload/v1745322688/nv7iyo7asoqhperuvbx7.jpg",
        "https://res.cloudinary.com/ds6adqnyz/image/upload/v1745322766/gsc8ddbcdhncmeb563wm.jpg",
      ],
      "Harry Potter": [
        "https://res.cloudinary.com/ds6adqnyz/image/upload/v1745322700/czqmeczcznnakx5jvbmy.jpg",
        "https://res.cloudinary.com/ds6adqnyz/image/upload/v1745322707/tbaokzp2rhng8aeseufa.webp",
        "https://res.cloudinary.com/ds6adqnyz/image/upload/v1745322722/f1jpr3dbwbj9iujpqswo.jpg",
        "https://res.cloudinary.com/ds6adqnyz/image/upload/v1745322688/nv7iyo7asoqhperuvbx7.jpg",
        "https://res.cloudinary.com/ds6adqnyz/image/upload/v1745322766/gsc8ddbcdhncmeb563wm.jpg",
      ],            
    "DC": [
        "https://res.cloudinary.com/ds6adqnyz/image/upload/v1745323019/csnodpafvdga137wmqlx.jpg",
        "https://res.cloudinary.com/ds6adqnyz/image/upload/v1745323024/f0edcobxnl9iwvmv8zfz.jpg",
        "https://res.cloudinary.com/ds6adqnyz/image/upload/v1745323021/kximo8f1h3tk0ky7vdro.webp",
        "https://res.cloudinary.com/ds6adqnyz/image/upload/v1745323019/csnodpafvdga137wmqlx.jpg",
        "https://res.cloudinary.com/ds6adqnyz/image/upload/v1745323019/csnodpafvdga137wmqlx.jpg",
        "https://res.cloudinary.com/ds6adqnyz/image/upload/v1745322494/lkerflnrmwmk0mjggfvb.jpg",
      ],
      "The Lord of the Rings": [
        "https://res.cloudinary.com/ds6adqnyz/image/upload/v1745323178/zlvrjuzfidsqhevogblz.jpg",
        "https://res.cloudinary.com/ds6adqnyz/image/upload/v1745323181/bkxbk7wj3kgqmyvvzti0.jpg",
        "https://res.cloudinary.com/ds6adqnyz/image/upload/v1745323176/su8uveewxv2x9nvoavny.webp",
        "https://res.cloudinary.com/ds6adqnyz/image/upload/v1745323174/x65cmqtjhcazcdagfr1r.jpg",
        "https://res.cloudinary.com/ds6adqnyz/image/upload/v1745323171/dfzzzd6sbks9toznwzlm.webp",
        "https://res.cloudinary.com/ds6adqnyz/image/upload/v1745323169/hopqr6hlvzjaq1ppyda5.webp",
      ],
      "Nintendo": [
        "https://res.cloudinary.com/ds6adqnyz/image/upload/v1745323341/om1jbmvuakh0rzcito74.avif",
        "https://res.cloudinary.com/ds6adqnyz/image/upload/v1745323344/y9tdygjnwldc8nwqoxm1.avif",
        "https://res.cloudinary.com/ds6adqnyz/image/upload/v1745323337/ygmeqmvxthfwqdwhqxeh.avif",
        "https://res.cloudinary.com/ds6adqnyz/image/upload/v1745323346/wrutip7clry8024wzfrp.avif",
        "https://res.cloudinary.com/ds6adqnyz/image/upload/v1745323334/i5zvln60afh9lnnqxqbx.avif",
        "https://res.cloudinary.com/ds6adqnyz/image/upload/v1745323331/mfmfhs4q3jrq9j1txhkl.avif",
      ],
    },
    "Figuras de acción": {
      "Dragon Ball": [
        "https://res.cloudinary.com/ds6adqnyz/image/upload/v1745309956/adverts/67fbab80b3466997a0e773ab/khftwt6zdmm8sdi8tbd8.webp",
        "https://res.cloudinary.com/ds6adqnyz/image/upload/v1745309955/adverts/67fbab80b3466997a0e773ab/t3xjprxc1ewap4eacizm.png",
        "https://res.cloudinary.com/ds6adqnyz/image/upload/v1745309953/adverts/67fbab80b3466997a0e773ab/x0jnyuumhsstjwjapjzy.avif",
        "https://res.cloudinary.com/ds6adqnyz/image/upload/v1745309953/adverts/67fbab80b3466997a0e773ab/az9vuse5hmbfteaoqsbb.jpg",
      ],

      "Star Wars": [
        "https://res.cloudinary.com/ds6adqnyz/image/upload/v1745319967/lvdszzinhruhkkbvwuys.jpg",
        "https://res.cloudinary.com/ds6adqnyz/image/upload/v1745320223/m7r7nhdyjpgygklblttq.jpg",
        "https://res.cloudinary.com/ds6adqnyz/image/upload/v1745319992/bdrlci4yzzkjulr7t90x.jpg",
        "https://res.cloudinary.com/ds6adqnyz/image/upload/v1745319967/lvdszzinhruhkkbvwuys.jpg",
        "https://res.cloudinary.com/ds6adqnyz/image/upload/v1745319983/krpcox6kkwsim0bn0ozq.jpg",
      ],
      "Disney": [
        "https://res.cloudinary.com/ds6adqnyz/image/upload/v1745322325/dcxbzroiwnme4bmuuhou.jpg",
        "https://res.cloudinary.com/ds6adqnyz/image/upload/v1745322296/enzhz7rmtjx3ppjwnhxo.jpg",
        "https://res.cloudinary.com/ds6adqnyz/image/upload/v1745322313/daspsvgollklqog9vxbc.jpg",
        "https://res.cloudinary.com/ds6adqnyz/image/upload/v1745322303/dz78flzlwednz6ill8of.jpg",
        "https://res.cloudinary.com/ds6adqnyz/image/upload/v1745322287/fnjkvq2zgsy4gqlvvndi.jpg",
      ],
      "Marvel": [
        "https://res.cloudinary.com/ds6adqnyz/image/upload/v1745322457/dikergbonrnbgrmb1hgz.jpg",
        "https://res.cloudinary.com/ds6adqnyz/image/upload/v1745322458/z85mwlihu3f84swvgt0h.jpg",
        "https://res.cloudinary.com/ds6adqnyz/image/upload/v1745322477/wqwuukoa1apvhychnspo.jpg",
        "https://res.cloudinary.com/ds6adqnyz/image/upload/v1745322565/t6oqbmay4zsqf1y6iwv2.jpg",
        "https://res.cloudinary.com/ds6adqnyz/image/upload/v1745322473/scxneqbjm6oluhc0htgg.jpg",
      ],
      "Harry Potter": [
        "https://res.cloudinary.com/ds6adqnyz/image/upload/v1745322688/nv7iyo7asoqhperuvbx7.jpg",
        "https://res.cloudinary.com/ds6adqnyz/image/upload/v1745322700/czqmeczcznnakx5jvbmy.jpg",
        "https://res.cloudinary.com/ds6adqnyz/image/upload/v1745322707/tbaokzp2rhng8aeseufa.webp",
        "https://res.cloudinary.com/ds6adqnyz/image/upload/v1745322722/f1jpr3dbwbj9iujpqswo.jpg",
        "https://res.cloudinary.com/ds6adqnyz/image/upload/v1745322766/gsc8ddbcdhncmeb563wm.jpg",
      ],
      "Harry Potter": [
        "https://res.cloudinary.com/ds6adqnyz/image/upload/v1745322766/gsc8ddbcdhncmeb563wm.jpg",
        "https://res.cloudinary.com/ds6adqnyz/image/upload/v1745322700/czqmeczcznnakx5jvbmy.jpg",
        "https://res.cloudinary.com/ds6adqnyz/image/upload/v1745322707/tbaokzp2rhng8aeseufa.webp",
        "https://res.cloudinary.com/ds6adqnyz/image/upload/v1745322722/f1jpr3dbwbj9iujpqswo.jpg",
        "https://res.cloudinary.com/ds6adqnyz/image/upload/v1745322688/nv7iyo7asoqhperuvbx7.jpg",
      ],            
      "DC": [
      "https://res.cloudinary.com/ds6adqnyz/image/upload/v1745323019/csnodpafvdga137wmqlx.jpg",
        "https://res.cloudinary.com/ds6adqnyz/image/upload/v1745323019/csnodpafvdga137wmqlx.jpg",
        "https://res.cloudinary.com/ds6adqnyz/image/upload/v1745323024/f0edcobxnl9iwvmv8zfz.jpg",
        "https://res.cloudinary.com/ds6adqnyz/image/upload/v1745323021/kximo8f1h3tk0ky7vdro.webp",
        "https://res.cloudinary.com/ds6adqnyz/image/upload/v1745323019/csnodpafvdga137wmqlx.jpg",
        "https://res.cloudinary.com/ds6adqnyz/image/upload/v1745322494/lkerflnrmwmk0mjggfvb.jpg",
      ],
      "The Lord of the Rings": [
        "https://res.cloudinary.com/ds6adqnyz/image/upload/v1745323176/su8uveewxv2x9nvoavny.webp",
        "https://res.cloudinary.com/ds6adqnyz/image/upload/v1745323178/zlvrjuzfidsqhevogblz.jpg",
        "https://res.cloudinary.com/ds6adqnyz/image/upload/v1745323181/bkxbk7wj3kgqmyvvzti0.jpg",
        "https://res.cloudinary.com/ds6adqnyz/image/upload/v1745323174/x65cmqtjhcazcdagfr1r.jpg",
        "https://res.cloudinary.com/ds6adqnyz/image/upload/v1745323171/dfzzzd6sbks9toznwzlm.webp",
        "https://res.cloudinary.com/ds6adqnyz/image/upload/v1745323169/hopqr6hlvzjaq1ppyda5.webp",
      ],
      "Nintendo": [
        "https://res.cloudinary.com/ds6adqnyz/image/upload/v1745323337/ygmeqmvxthfwqdwhqxeh.avif",
        "https://res.cloudinary.com/ds6adqnyz/image/upload/v1745323341/om1jbmvuakh0rzcito74.avif",
        "https://res.cloudinary.com/ds6adqnyz/image/upload/v1745323344/y9tdygjnwldc8nwqoxm1.avif",
        "https://res.cloudinary.com/ds6adqnyz/image/upload/v1745323346/wrutip7clry8024wzfrp.avif",
        "https://res.cloudinary.com/ds6adqnyz/image/upload/v1745323334/i5zvln60afh9lnnqxqbx.avif",
        "https://res.cloudinary.com/ds6adqnyz/image/upload/v1745323331/mfmfhs4q3jrq9j1txhkl.avif",
      ],
    },
    "Ropa y accesorios": {
      "Dragon Ball": [
        "https://res.cloudinary.com/ds6adqnyz/image/upload/v1745309953/adverts/67fbab80b3466997a0e773ab/x0jnyuumhsstjwjapjzy.avif",
        "https://res.cloudinary.com/ds6adqnyz/image/upload/v1745309956/adverts/67fbab80b3466997a0e773ab/khftwt6zdmm8sdi8tbd8.webp",
        "https://res.cloudinary.com/ds6adqnyz/image/upload/v1745309955/adverts/67fbab80b3466997a0e773ab/t3xjprxc1ewap4eacizm.png",
        "https://res.cloudinary.com/ds6adqnyz/image/upload/v1745309953/adverts/67fbab80b3466997a0e773ab/az9vuse5hmbfteaoqsbb.jpg",
      ],

      "Star Wars": [
        "https://res.cloudinary.com/ds6adqnyz/image/upload/v1745319983/krpcox6kkwsim0bn0ozq.jpg",
        "https://res.cloudinary.com/ds6adqnyz/image/upload/v1745319967/lvdszzinhruhkkbvwuys.jpg",
        "https://res.cloudinary.com/ds6adqnyz/image/upload/v1745320223/m7r7nhdyjpgygklblttq.jpg",
        "https://res.cloudinary.com/ds6adqnyz/image/upload/v1745319992/bdrlci4yzzkjulr7t90x.jpg",
        "https://res.cloudinary.com/ds6adqnyz/image/upload/v1745319967/lvdszzinhruhkkbvwuys.jpg",
      ],
      "Disney": [
        "https://res.cloudinary.com/ds6adqnyz/image/upload/v1745322287/fnjkvq2zgsy4gqlvvndi.jpg",
        "https://res.cloudinary.com/ds6adqnyz/image/upload/v1745322325/dcxbzroiwnme4bmuuhou.jpg",
        "https://res.cloudinary.com/ds6adqnyz/image/upload/v1745322296/enzhz7rmtjx3ppjwnhxo.jpg",
        "https://res.cloudinary.com/ds6adqnyz/image/upload/v1745322313/daspsvgollklqog9vxbc.jpg",
        "https://res.cloudinary.com/ds6adqnyz/image/upload/v1745322303/dz78flzlwednz6ill8of.jpg",
      ],
      "Marvel": [
        "https://res.cloudinary.com/ds6adqnyz/image/upload/v1745322473/scxneqbjm6oluhc0htgg.jpg",
        "https://res.cloudinary.com/ds6adqnyz/image/upload/v1745322457/dikergbonrnbgrmb1hgz.jpg",
        "https://res.cloudinary.com/ds6adqnyz/image/upload/v1745322458/z85mwlihu3f84swvgt0h.jpg",
        "https://res.cloudinary.com/ds6adqnyz/image/upload/v1745322477/wqwuukoa1apvhychnspo.jpg",
        "https://res.cloudinary.com/ds6adqnyz/image/upload/v1745322565/t6oqbmay4zsqf1y6iwv2.jpg",
      ],
      "Harry Potter": [
        "https://res.cloudinary.com/ds6adqnyz/image/upload/v1745322766/gsc8ddbcdhncmeb563wm.jpg",
        "https://res.cloudinary.com/ds6adqnyz/image/upload/v1745322688/nv7iyo7asoqhperuvbx7.jpg",
        "https://res.cloudinary.com/ds6adqnyz/image/upload/v1745322700/czqmeczcznnakx5jvbmy.jpg",
        "https://res.cloudinary.com/ds6adqnyz/image/upload/v1745322707/tbaokzp2rhng8aeseufa.webp",
        "https://res.cloudinary.com/ds6adqnyz/image/upload/v1745322722/f1jpr3dbwbj9iujpqswo.jpg",
      ],
      "Harry Potter": [
        "https://res.cloudinary.com/ds6adqnyz/image/upload/v1745322688/nv7iyo7asoqhperuvbx7.jpg",
        "https://res.cloudinary.com/ds6adqnyz/image/upload/v1745322766/gsc8ddbcdhncmeb563wm.jpg",
        "https://res.cloudinary.com/ds6adqnyz/image/upload/v1745322700/czqmeczcznnakx5jvbmy.jpg",
        "https://res.cloudinary.com/ds6adqnyz/image/upload/v1745322707/tbaokzp2rhng8aeseufa.webp",
        "https://res.cloudinary.com/ds6adqnyz/image/upload/v1745322722/f1jpr3dbwbj9iujpqswo.jpg",
      ],            
      "DC": [
        "https://res.cloudinary.com/ds6adqnyz/image/upload/v1745322494/lkerflnrmwmk0mjggfvb.jpg",
      "https://res.cloudinary.com/ds6adqnyz/image/upload/v1745323019/csnodpafvdga137wmqlx.jpg",
        "https://res.cloudinary.com/ds6adqnyz/image/upload/v1745323019/csnodpafvdga137wmqlx.jpg",
        "https://res.cloudinary.com/ds6adqnyz/image/upload/v1745323024/f0edcobxnl9iwvmv8zfz.jpg",
        "https://res.cloudinary.com/ds6adqnyz/image/upload/v1745323021/kximo8f1h3tk0ky7vdro.webp",
        "https://res.cloudinary.com/ds6adqnyz/image/upload/v1745323019/csnodpafvdga137wmqlx.jpg",
      ],
      "The Lord of the Rings": [
        "https://res.cloudinary.com/ds6adqnyz/image/upload/v1745323169/hopqr6hlvzjaq1ppyda5.webp",
        "https://res.cloudinary.com/ds6adqnyz/image/upload/v1745323176/su8uveewxv2x9nvoavny.webp",
        "https://res.cloudinary.com/ds6adqnyz/image/upload/v1745323178/zlvrjuzfidsqhevogblz.jpg",
        "https://res.cloudinary.com/ds6adqnyz/image/upload/v1745323181/bkxbk7wj3kgqmyvvzti0.jpg",
        "https://res.cloudinary.com/ds6adqnyz/image/upload/v1745323174/x65cmqtjhcazcdagfr1r.jpg",
        "https://res.cloudinary.com/ds6adqnyz/image/upload/v1745323171/dfzzzd6sbks9toznwzlm.webp",
      ],
      "Nintendo": [
        "https://res.cloudinary.com/ds6adqnyz/image/upload/v1745323331/mfmfhs4q3jrq9j1txhkl.avif",
        "https://res.cloudinary.com/ds6adqnyz/image/upload/v1745323337/ygmeqmvxthfwqdwhqxeh.avif",
        "https://res.cloudinary.com/ds6adqnyz/image/upload/v1745323341/om1jbmvuakh0rzcito74.avif",
        "https://res.cloudinary.com/ds6adqnyz/image/upload/v1745323344/y9tdygjnwldc8nwqoxm1.avif",
        "https://res.cloudinary.com/ds6adqnyz/image/upload/v1745323346/wrutip7clry8024wzfrp.avif",
        "https://res.cloudinary.com/ds6adqnyz/image/upload/v1745323334/i5zvln60afh9lnnqxqbx.avif",
      ],
    },
    }

    const randomId = (arr) => arr[Math.floor(Math.random() * arr.length)];

  for (const user of users) {
    const userAdverts = Array.from({ length: 150 }).map((_, i) => {
      const selectedProductType = randomId(types);
      const selectedUniverse = randomId(universes);
      console.log(selectedUniverse)
      console.log(selectedProductType)

      const productTypeName = selectedProductType.name;
      const universeName = selectedUniverse.name;

      const fallbackImages = [
        "https://res.cloudinary.com/ds6adqnyz/image/upload/v1745309956/adverts/67fbab80b3466997a0e773ab/khftwt6zdmm8sdi8tbd8.webp",
        "https://res.cloudinary.com/ds6adqnyz/image/upload/v1745323346/wrutip7clry8024wzfrp.avif",
        "https://res.cloudinary.com/ds6adqnyz/image/upload/v1745322494/lkerflnrmwmk0mjggfvb.jpg",
        "https://res.cloudinary.com/ds6adqnyz/image/upload/v1745323169/hopqr6hlvzjaq1ppyda5.webp",
        "https://res.cloudinary.com/ds6adqnyz/image/upload/v1745323334/i5zvln60afh9lnnqxqbx.avif",
        "https://res.cloudinary.com/ds6adqnyz/image/upload/v1745323024/f0edcobxnl9iwvmv8zfz.jpg",
      ];

      const images =
        imageMap[productTypeName]?.[universeName] || fallbackImages;

      return {
        title: `Producto ${i + 1} de ${user.username}`,
        slug: `Producto ${i + 1} de ${user.username}`,
        description: `Descripción generada para ${productTypeName} - ${universeName}`,
        price: Math.floor(Math.random() * 3000 + 10),
        transaction: randomId(transactions)._id,
        status: randomId(statuses)._id,
        product_type: selectedProductType._id,
        universe: selectedUniverse._id,
        condition: randomId(conditions)._id,
        brand: randomId(brands)?._id,
        tags: ["oferta", productTypeName.toLowerCase()],
        user: user._id,
        mainImage: images[0],
        images,
      };
    });

    await Advert.insertMany(userAdverts);
    console.log(`Anuncios creados para ${user.username}`);
  }

  console.log("Todos los anuncios generados");
}

async function main() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Conectado a MongoDB");
    await initUsers();
    await initAdverts();
  } catch (err) {
    console.error("Error al inicializar la BD:", err);
  } finally {
    await mongoose.disconnect();
    console.log("Desconectado de MongoDB");
  }
}

main();
