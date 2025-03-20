"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Booking extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Booking.belongsTo(models.User, {
        foreignKey: "userId",
        as: "user",
      });
      Booking.belongsTo(models.ServicePrice, {
        foreignKey: "servicePriceId",
        as: "servicePrice",
      });
    }
  }
  Booking.init(
    {
      id: {
        allowNull: false,
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      userId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "User",
          key: "id",
        },
      },
      servicePriceId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "ServicePrice",
          key: "id",
        },
      },
      bookingDate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        validate: {
          notNull: { msg: "Booking date is required" },
          isAfterOrToday(value) {
            const today = new Date().toISOString().split("T")[0];
            if (new Date(value) < new Date(today)) {
              throw new ValidationError("Booking date cannot be in the past");
            }
          },
        },
      },
      bookingTime: {
        type: DataTypes.TIME,
        allowNull: false,
        validate: {
          notNull: { msg: "Booking time is required" },
        },
      },
      licensePlate: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: { msg: "License plate is required" },
          len: {
            args: [5, 10],
            msg: "License plate must be between 5 and 10 characters",
          },
        },
      },
      status: {
        type: DataTypes.ENUM("pending", "confirmed", "completed", "canceled"),
        allowNull: false,
        defaultValue: "pending",
      },
    },
    {
      sequelize,
      modelName: "Booking",
    }
  );

  return Booking;
};
