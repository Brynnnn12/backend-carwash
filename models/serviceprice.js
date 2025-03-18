'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class ServicePrice extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      ServicePrice.belongsTo(models.Service, {
        foreignKey: 'serviceId',
        as: 'service',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      });
    }
  }
  ServicePrice.init({
    id: {
      allowNull: false,
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    serviceId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Services',
        key: 'id'
      },
      validate: {
        notNull: { msg: "Service ID tidak boleh kosong" },
        isUUID: { args: 4, msg: "Service ID harus berupa UUID" }
      }
    },
    car_type: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: { msg: "Tipe kendaraan tidak boleh kosong" },
        len: {
          args: [2, 50],
          msg: "Tipe kendaraan harus memiliki panjang 2-50 karakter"
        }
      }
    },
    price: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        notNull: { msg: "Harga tidak boleh kosong" },
        isInt: { msg: "Harga harus berupa angka bulat" },
        min: {
          args: [10000],
          msg: "Harga harus minimal 10000"
        }
      }
    }
  },
    {
      hooks: {
        beforeCreate: async (servicePrice, options) => {
          if (servicePrice.price < 10000) {
            throw new Error("Harga minimal harus 1000");
          }
          const service = await sequelize.models.Service.findByPk(servicePrice.serviceId);
          if (!service) {
            throw new Error("Service tidak ditemukan");
          }
        }
      }
    },
  {
    sequelize,
    modelName: 'ServicePrice',
    tableName: 'ServicePrices',
    

  });
  return ServicePrice;
};