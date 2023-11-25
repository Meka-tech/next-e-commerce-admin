import { model, Schema, models } from "mongoose";

const imageSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  link: {
    type: String,
    required: true
  }
});
const ProductSchema = new Schema({
  title: { type: String, required: true },
  description: String,
  images: {
    type: [imageSchema],
    required: true
  },
  price: { type: Number, required: true },
  category: { type: Schema.Types.ObjectId, ref: "category" },
  properties: { type: Object }
});

const Product = models.product || model("product", ProductSchema);

export default Product;
