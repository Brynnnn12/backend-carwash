'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class ServicePrice extends Model {
    static associate(models) {
      ServicePrice.belongsTo(models.Service, {
        foreignKey: 'serviceId',
        as: 'service',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      });
    }
  }

  ServicePrice.init(
    {
      id: {
        allowNull: false,
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      serviceId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'Services',
          key: 'id',
        },
        validate: {
          notNull: { msg: "Service ID tidak boleh kosong" },
          isUUID: { args: 4, msg: "Service ID harus berupa UUID" },
        },
      },
      car_type: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: { msg: "Tipe kendaraan tidak boleh kosong" },
          len: {
            args: [2, 50],
            msg: "Tipe kendaraan harus memiliki panjang 2-50 karakter",
          },
        },
      },
      price: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          notNull: { msg: "Harga tidak boleh kosong" },
          isInt: { msg: "Harga harus berupa angka bulat" },
          min: {
            args: [10000],
            msg: "Harga harus minimal 10000",
          },
        },
      },
    },
    {
      sequelize,
      modelName: 'ServicePrice',
      tableName: 'ServicePrices',
      hooks: {
        beforeCreate: async (servicePrice, options) => {
          if (servicePrice.price < 10000) {
            throw new Error("Harga minimal harus 10000");
          }
          const service = await sequelize.models.Service.findByPk(servicePrice.serviceId);
          if (!service) {
            throw new Error("Service tidak ditemukan");
          }
        },
      },
    }
  );

  return ServicePrice;
};