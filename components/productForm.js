import axios from "axios";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Spinner from "./spinner";
import { ReactSortable } from "react-sortablejs";

export default function ProductForm({
  _id,
  title: existingTitle,
  description: existingDescription,
  price: existingPrice,
  images: existingImages,
  category: existingCategory,
  properties: existingProperties
}) {
  const [title, setTitle] = useState(existingTitle || "");
  const [description, setDescription] = useState(existingDescription || "");
  const [price, setPrice] = useState(existingPrice || "");
  const [images, setImages] = useState(existingImages || []);
  const [goToProducts, setGoToProducts] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [category, setCategory] = useState(existingCategory || "");
  const [productProperties, setProductProperties] = useState(
    existingProperties || {}
  );
  const router = useRouter();

  async function getCategories() {
    const result = await axios.get(`/api/categories`);
    setCategories(result.data.data);
  }
  async function saveProduct(e) {
    e.preventDefault();
    const data = {
      title,
      description,
      price,
      images,
      category,
      properties: productProperties
    };
    if (_id) {
      await axios.put("/api/products", { ...data, _id });
      setGoToProducts(true);
    } else {
      await axios.post("/api/products", data);
      setGoToProducts(true);
    }
  }
  if (goToProducts) {
    router.push("/products");
  }
  async function uploadImages(ev) {
    const files = ev.target?.files;

    if (files?.length > 0) {
      setUploading(true);
      const data = new FormData();
      for (const file of files) {
        data.append("file", file);
      }
      const res = await axios.post("/api/upload", data);

      setImages((oldImages) => {
        return [...oldImages, ...res.data.images];
      });
      setUploading(false);
    }
  }

  function updateImagesOrder(images) {
    setImages(images);
  }

  const propertiestoFill = [];

  if (categories.length > 0 && category) {
    let selectedCatInfo = categories.find((cat) => cat._id === category);
    propertiestoFill.push(...selectedCatInfo.properties);
    while (selectedCatInfo?.parent?._id) {
      const parentCategory = categories.find(
        (cat) => cat._id === selectedCatInfo?.parent?._id
      );
      propertiestoFill.push(...parentCategory.properties);
      selectedCatInfo = parentCategory;
    }
  }

  function setProductProp(propName, value) {
    setProductProperties((prev) => {
      const newProductProps = { ...prev };
      newProductProps[propName] = value;
      return newProductProps;
    });
  }

  useEffect(() => {
    getCategories();
  }, []);

  return (
    <form onSubmit={saveProduct}>
      <label>Product name</label>
      <input
        type="text"
        placeholder="product name"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <label>Category</label>
      <select value={category} onChange={(e) => setCategory(e.target.value)}>
        <option value="">UnCategorized</option>
        {categories.length > 0 &&
          categories.map((category, index) => {
            return (
              <option key={index} value={category._id}>
                {category.name}
              </option>
            );
          })}
      </select>
      {propertiestoFill.length > 0 &&
        propertiestoFill.map((p, i) => {
          return (
            <div key={i}>
              <label>{p.name[0].toUpperCase() + p.name.substring(1)}</label>
              <div>
                {" "}
                <select
                  value={productProperties[p.name]}
                  onChange={(e) => setProductProp(p.name, e.target.value)}
                >
                  <option value={""}>Select</option>
                  {p.values.map((v, i) => (
                    <option value={v} key={i}>
                      {v}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          );
        })}
      <label>Photos </label>
      <div className="mb-2 flex flex-wrap gap-1">
        <ReactSortable
          list={images}
          className="flex flex=wrap gap-1"
          setList={updateImagesOrder}
        >
          {!!images?.length &&
            images.map((image, i) => {
              return (
                <div
                  key={i}
                  className="h-24 bg-white p-4 shadow-sm rounded-sm border border-gray-200"
                >
                  <img src={image?.link} alt="" className="rounded-lg" />
                </div>
              );
            })}
        </ReactSortable>
        {uploading && (
          <div className="h-24  flex item-center">
            <Spinner />
          </div>
        )}
        <label className=" w-24 h-24 cursor-pointer text-center  flex flex-col items-center justify-center text-sm gap-1 text-primary rounded-sm bg-white shadow-sm border border-primary">
          {" "}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
            />
          </svg>
          <div>Add image</div>
          <input type="file" onChange={uploadImages} className="hidden" />
        </label>
        {!images?.length && <div>No photos in this product</div>}
      </div>
      <label>Description</label>
      <textarea
        placeholder="description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      ></textarea>
      <label>Price (in naira)</label>
      <input
        type="number"
        placeholder="price"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
      />
      <button type="submit" className="btn-primary">
        Save
      </button>
    </form>
  );
}
