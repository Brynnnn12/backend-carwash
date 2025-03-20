'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Profile extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Profile.belongsTo(models.User, {
        foreignKey: "userId",
        as: "user", // Bisa digunakan untuk include
        onDelete: "CASCADE", // Jika user dihapus, profil ikut terhapus
      });
    }
  }
  Profile.init({
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: { msg: "Nama wajib diisi" }
      }
    },
    address: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: { msg: "Alamat wajib diisi" }
      }
    },
    avatar: {
      type: DataTypes.STRING,
      allowNull: true, // Opsional
    },
    phoneNumber: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: { msg: "Nomor telepon wajib diisi" },
        isNumeric: { msg: "Nomor telepon harus berupa angka" },
        len: { args: [10, 15], msg: "Nomor telepon harus antara 10-15 digit" }
      }
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      validate: {
        notNull: { msg: "User ID tidak boleh kosong" },
        async isExist(value) {
          const user = await sequelize.models.User.findByPk(value);
          if (!user) {
            throw new Error("User tidak ditemukan");
          }
        }
      }
    }
  }, {
    sequelize,
    modelName: 'Profile',
  });
  return Profile;
};