'use strict';
const {
  Model
} = require('sequelize');
const bcrypt = require("bcrypt");
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      User.belongsTo(models.Role, {
        foreignKey: "roleId",
        as: "role",
        onDelete: "SET NULL", // Jika role dihapus, user tidak ikut terhapus
      });
      User.hasOne(models.Profile, {
        foreignKey: "userId",
        as: "profile", // Gunakan alias agar lebih mudah saat include
      });
      
    }
  }
  User.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false, // Harus ditambahkan
      unique: true,
      validate: {
        notNull: { msg: "Username tidak boleh kosong" }, // Hanya boleh jika allowNull: false
        len: {
          args: [3, 50],
          msg: "Username harus memiliki panjang 3-50 karakter"
        }
      }
    }
    ,
    email: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
      validate: {
        notNull: {
          msg: "Email wajib diisi",
        },
        isEmail: {
          msg: "Format email tidak valid",
        },
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: {
          msg: "Kata sandi wajib diisi",
        },
        len: {
          args: [8, 100],
          msg: "Kata sandi harus terdiri dari minimal 8 karakter",
        },
      },
    },
    roleId: {
      type: DataTypes.UUID,

    },
  },
  {
    hooks:{
      beforeCreate : async (user) => {
      if(user.password){
        const salt = await bcrypt.genSaltSync(10);
        user.password = bcrypt.hashSync(user.password, salt);
      }
      if(!user.roleId){
        const roleUser = await sequelize.models.Role.findOne({
          where: {
            name: "user"
          }
        })
        user.roleId = roleUser.id;
      }
    }
    },
    sequelize,
    modelName: 'User',
  });
  User.prototype.CorrectPassword = async(reqPassword, userPassword) => {
    return await bcrypt.compare(reqPassword, userPassword);
  }
  return User;
};