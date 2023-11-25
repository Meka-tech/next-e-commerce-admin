import Layout from "@/components/layout";
import axios from "axios";
import { useEffect, useState } from "react";
import { withSwal } from "react-sweetalert2";

function Categories({ swal }) {
  const [name, setName] = useState("");
  const [categories, setCategories] = useState([]);
  const [parentCategory, setParentCategory] = useState("");
  const [editedCategory, setEditedCategory] = useState(null);
  const [properties, setProperties] = useState([]);

  async function getCategories() {
    const result = await axios.get(`/api/categories`);
    setCategories(result.data.data);
  }
  async function saveCategory(e) {
    e.preventDefault();
    const data = {
      name,
      parentCategory,
      properties: properties.map((p) => ({
        name: p.name,
        values: p.values.split(",")
      }))
    };
    if (editedCategory) {
      await axios.put(`/api/categories`, { ...data, _id: editedCategory._id });

      setEditedCategory(null);
      setParentCategory("");
    } else {
      await axios.post(`/api/categories`, data);
    }
    setProperties([]);
    setName("");
    getCategories();
  }

  function editCategory(category) {
    setEditedCategory(category);
    setName(category.name);
    setParentCategory(category.parent?._id);

    let properties = category.properties;

    let valuesArray;
    properties.map((property, i) => {
      valuesArray = property.values;
      let ValuesString = "";
      valuesArray?.map((value, i) => {
        if (value === valuesArray[valuesArray.length - 1]) {
          return (ValuesString = ValuesString + `${value}`);
        }
        return (ValuesString = ValuesString + `${value},`);
      });
      return (property.values = ValuesString);
    });

    setProperties(properties);
  }
  function deleteCategory(category) {
    swal
      .fire({
        title: "Are you sure ?",
        text: `Do you want to delete ${category.name} ?`,
        showCancelButton: true,
        cancelButtonText: "Cancel",
        confirmButtonText: "Yes, Delete",
        reverseButtons: true,
        confirmButtonColor: "#d55"
      })
      .then((result) => {
        if (result.isConfirmed) {
          axios.delete(`/api/categories?id=` + category._id);
          getCategories();
        }
      })
      .catch(() => {});
  }
  function addProperty() {
    setProperties((prev) => {
      return [...prev, { name: "", values: "" }];
    });
  }

  function handlePropertyNameChange(index, property, newName) {
    setProperties((prev) => {
      const properties = [...prev];
      properties[index].name = newName;
      return properties;
    });
  }
  function handlePropertyValueChange(index, property, newValue) {
    setProperties((prev) => {
      const properties = [...prev];
      properties[index].values = newValue;
      return properties;
    });
  }

  function removeProperty(indextoRemove) {
    setProperties((prev) => {
      const newProperties = [...prev].filter((p, pindex) => {
        return pindex !== indextoRemove;
      });

      return newProperties;
    });
  }
  useEffect(() => {
    getCategories();
  }, []);

  return (
    <Layout>
      <h1>Categories</h1>
      <label>
        {editedCategory
          ? `Edit Category ${editedCategory?.name}`
          : "Create New Category"}{" "}
      </label>
      <form onSubmit={saveCategory}>
        <div className="flex gap-1">
          <input
            type="text"
            placeholder={"Category name"}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <select
            value={parentCategory}
            onChange={(e) => setParentCategory(e.target.value)}
          >
            <option value={"1"}>No Parent Category</option>
            {categories.length > 0 &&
              categories.map((category, index) => {
                return (
                  <option key={index} value={category._id}>
                    {category.name}
                  </option>
                );
              })}
          </select>
        </div>
        <div className="mb-2">
          <label className="block">Properties</label>
          <button
            onClick={addProperty}
            type="button"
            className="btn-default text-sm mb-2"
          >
            Add new property
          </button>
          {properties.length > 0 &&
            properties.map((property, i) => {
              return (
                <div className="flex gap-1 mb-2" key={i}>
                  <input
                    type="text"
                    className="mb-0"
                    placeholder="property name (example : color)"
                    value={property.name}
                    onChange={(e) =>
                      handlePropertyNameChange(i, property, e.target.value)
                    }
                  />
                  <input
                    type="text"
                    className="mb-0"
                    placeholder="values , comma seperated"
                    value={property.values}
                    onChange={(e) =>
                      handlePropertyValueChange(i, property, e.target.value)
                    }
                  />
                  <button
                    type="button"
                    onClick={() => removeProperty(i)}
                    className="btn-red"
                  >
                    Remove
                  </button>
                </div>
              );
            })}
        </div>
        <div className="flex gap-1">
          {editedCategory && (
            <button
              type="button"
              onClick={() => {
                setEditedCategory(null);
                setName("");
                setParentCategory("");
                setProperties([]);
              }}
              className="btn-default"
            >
              Cancel
            </button>
          )}
          <button className="btn-primary py-1" type="submit">
            Save
          </button>
        </div>
      </form>
      {!editedCategory && (
        <table className="basic mt-4">
          <thead>
            <tr>
              <td>Category Name</td>
              <td>Parent category</td>
              <td></td>
            </tr>
          </thead>
          <tbody>
            {categories.length > 0 &&
              categories.map((category, index) => {
                return (
                  <tr key={index}>
                    <td>{category.name}</td>
                    <td>{category?.parent?.name}</td>
                    <td>
                      <button
                        onClick={() => editCategory(category)}
                        className="btn-default mr-1"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteCategory(category)}
                        className="btn-red"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      )}
    </Layout>
  );
}

export default withSwal(({ swal }, red) => <Categories swal={swal} />);
