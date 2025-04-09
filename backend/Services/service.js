const dbOperation=require('../Database/dbOperations')
const { ObjectId } = require('mongodb');
const { uploadMultipleImagesToGCS,generateSignedUrl,uploadImageToGCS } = require('./gcsService');
const { v4: uuidv4 } = require('uuid'); 

module.exports = {

    login: async function(username,password) {
        try {
            const category={username,password}
            const result = await dbOperation.executeMongoQuery('SPACEFYD', 'find', [category]);
            if (result){
                return { success: true, data: result };
            }else{
                return{success:false,data:None}
            }
        } catch (error) {
            return { success: false, error: error.message };
        }
    },

    addCategory: async function (name, image, type) {
        try {
            const category = { name, image, type };
            let tableName;
    
            if (type.toLowerCase() === 'product') {
                tableName = 'PRODUCT_CATEGORY';
    
                // Generate a unique filename using UUID
                const uniqueFileName = `Product_${name.replace(/\s+/g, '_')}_${uuidv4()}`;
    
                // Upload image to the bucket with a unique filename
                const uploadedImage = await uploadImageToGCS(image, uniqueFileName);
                category.image = uploadedImage; // Save the uploaded image URL in the category
            } else {
                tableName = 'PROJECT_CATEGORY';
            }
    
            const result = await dbOperation.executeMongoQuery(tableName, 'insert', [category]);
            return { success: true, data: result };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },
    
    


    editCategory: async function (id, newname, type, image) {
        try {
            let tableName = type.toLowerCase() === 'product' ? 'PRODUCT_CATEGORY' : 'PROJECT_CATEGORY';
    
            let update = { $set: { name: newname } }; // Default update only for name
    
            if (type.toLowerCase() === 'product' && image) {
                let imageUrl = image; // Default to provided image
    
                if (typeof image === 'string' && image.startsWith('data:image')) {
                    // If it's a base64 image, upload it
                    const uploadedUrls = await uploadMultipleImagesToGCS([image], id, 'category');
                    imageUrl = uploadedUrls.length > 0 ? uploadedUrls[0] : null;
                } else {
                    // If it's an existing URL, clean it
                    imageUrl = this.cleanUrl(image);
                }
    
                update.$set.image = imageUrl; // Update image only for product categories
            }
    
            const filter = { _id: new ObjectId(id) };
            const result = await dbOperation.executeMongoQuery(tableName, 'update', { filter, update });
    
            return { success: true, data: result };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },
     

    deleteCategory: async function (ids, type) {
        try {
            let categoryTable, itemTable,subcategoryTable;
            if (type.toLowerCase() === 'product') {
                categoryTable = 'PRODUCT_CATEGORY';
                itemTable = 'Products';
                subcategoryTable = 'PRODUCT_SUBCATEGORY';
            } else {
                categoryTable = 'PROJECT_CATEGORY';
                itemTable = 'Projects';
            }
    
            if (Array.isArray(ids)) {
                const objectIds = ids.map(id => new ObjectId(id));
                const stringIds = ids.map(id => id.toString());
                
                // Delete all associated products/projects first
                const itemsResult = await dbOperation.executeMongoQuery(itemTable, 'delete', {
                    filter: { 
                        categoryId: { $in: stringIds }
                    }
                });
                
                let subcategoryResult = { deletedCount: 0 };
                if (type.toLowerCase() === 'product') {
                subcategoryResult = await dbOperation.executeMongoQuery(subcategoryTable, 'delete', {
                    filter: { 
                        categoryID: { $in: stringIds }
                    }
                });
            }
                // Then delete the categories
                const categoryResult = await dbOperation.executeMongoQuery(categoryTable, 'delete', {
             
                    filter: { 
                        _id: objectIds  
                    }
    
                });
                
                return { 
                    success: true, 
                    message: `${categoryResult.deletedCount} categories and ${itemsResult.deletedCount} ${type.toLowerCase()}s deleted successfully`, 
                    data: {
                        categories: categoryResult,
                        items: itemsResult
                    }
                };
            } else {
                const objectId = new ObjectId(ids);
                
                // Delete all associated products/projects first
                const itemsResult = await dbOperation.executeMongoQuery(itemTable, 'delete', {
                    filter: { 
                        categoryId: ids
                    }
                });

                let subcategoryResult = { deletedCount: 0 };
                if (type.toLowerCase() === 'product') {
                subcategoryResult = await dbOperation.executeMongoQuery(subcategoryTable, 'delete', {
                    filter: { 
                        categoryId: ids
                    }
                });
                }
            
                
                // Then delete the category
                const categoryResult = await dbOperation.executeMongoQuery(categoryTable, 'delete', { 
                    filter: { _id: objectId } 
                });
                
                if (categoryResult.deletedCount > 0) {
                    return { 
                        success: true, 
                        message: `Category and ${itemsResult.deletedCount} ${type.toLowerCase()}s deleted successfully`, 
                        data: {
                            category: categoryResult,
                            items: itemsResult
                        }
                    };
                } else {
                    return { success: false, message: 'Category not found or could not be deleted' };
                }
            }
        } catch (error) {
            console.error('Error deleting category:', error);
            return { success: false, error: error.message };
        }
    },

    displayCategory: async function (type) {
        try {
            let tableName = type.toLowerCase() === 'product' ? 'PRODUCT_CATEGORY' : 'PROJECT_CATEGORY';
    
            // Fetch categories
            const categories = await dbOperation.executeMongoQuery(tableName, 'find', {});
    
            if (type.toLowerCase() === 'product') {
                // Fetch subcategories and map them to their categories
                const categoryIds = categories.map(cat => cat._id.toString());
                const subCategories = await dbOperation.executeMongoQuery('PRODUCT_SUBCATEGORY', 'find', { categoryID: { $in: categoryIds } });
    
                // Map subcategories to their respective categories
                const categoryMap = {};
                subCategories.forEach(sub => {
                    if (!categoryMap[sub.categoryID]) {
                        categoryMap[sub.categoryID] = [];
                    }
                    categoryMap[sub.categoryID].push(sub); // Store entire subcategory data
                });
    
                // Attach subcategories and sign images for each category
                for (let cat of categories) {
                    cat.subCategory = categoryMap[cat._id] || []; // Assign subcategories
                    
                    // Sign image if it exists
                    if (cat.image) {
                        cat.image = await generateSignedUrl(cat.image);
                    }
                }
            }
    
            return { success: true, data: categories };
        } catch (e) {
            return { success: false, error: e.message };
        }
    },
    
    
    

    displayCategoryById:async function (id,type) {
        try{
            
            if (type.toLowerCase()=='product'){
                tableName='PRODUCT_CATEGORY'
            }
            else{
                tableName='PROJECT_CATEGORY'
            }
            const objectId = new ObjectId(id);
            const result= await dbOperation.executeMongoQuery(tableName,'find',{_id:objectId});
            return { success: true, data: result };

        }catch(e){
            return { success: false, error: error.message };
        }
        
    },
    addSubCategory: async function(name,categoryID) {
        try {
            const category={name,categoryID}
            const result = await dbOperation.executeMongoQuery('PRODUCT_SUBCATEGORY', 'insert', [category]);
            return { success: true, data: result };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },

    editSubCategory: async function(id,newname) {
        try {
            tableName='PRODUCT_SUBCATEGORY'
            const filter={_id: new ObjectId(id)};
            const update={$set:{name:newname}}
            const result = await dbOperation.executeMongoQuery(tableName, 'update', {filter,update});
            return { success: true, data: result };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },

    deleteSubCategory: async function (ids) {
        try {

            tableName = 'PRODUCT_SUBCATEGORY';

    
            if (Array.isArray(ids)) {
                const objectIds = ids.map(id => new ObjectId(id));
                
                const result = await dbOperation.executeMongoQuery(tableName, 'delete', {
                    filter: { 
                        _id: objectIds  
                    }
                });
                
                if (result.deletedCount > 0) {
                    return { success: true, message: 'sub Categories deleted successfully', data: result };
                } else {
                    return { success: false, message: 'No sub categories found to delete' };
                }
            } else {
                const objectId = new ObjectId(ids);
                const result = await dbOperation.executeMongoQuery(tableName, 'delete', { 
                    filter: { _id: objectId } 
                });
                
                if (result.deletedCount > 0) {
                    return { success: true, message: 'Sub Category deleted successfully', data: result };
                } else {
                    return { success: false, message: 'Sub Category not found or could not be deleted' };
                }
            }
        } catch (error) {
            console.error('Error deleting subcategory:', error);
            return { success: false, error: error.message };
        }
    },


    displaySubCategory: async function () {
        try {
            
            const result = await dbOperation.executeMongoQuery('PRODUCT_SUBCATEGORY','find',{});
            return { success: true, data: result };
        } catch(e) {
            return { success: false, error: e.message };  
        }
    },

    displaySubCategoryById:async function (id) {
        try{
            const result= await dbOperation.executeMongoQuery('PRODUCT_SUBCATEGORY','find',{categoryID: id});
            return { success: true, data: result };

        }catch(e){
            return { success: false, error: error.message };
        }
        
    },

    addProduct:async function (productName,description,categoryId,subCategoryId,productCode,brand,images,isVisible,isTrending,categoryName,subcategoryName) {
        try{
            const image = await uploadMultipleImagesToGCS(images,categoryId,"product");
            const category={productName,description,categoryId,subCategoryId,productCode,brand,image,isVisible,isTrending,categoryName,subcategoryName}
            const result= await dbOperation.executeMongoQuery('Products','insert',[category]);
            return { success: true, data: result };

        }catch(e){
            return { success: false, error: error.message };
        }
        
    },

    editProduct: async function (id, updateData) {
        try {
            const tableName = 'Products';
    
            if (!ObjectId.isValid(id)) {
                return { success: false, message: "Invalid Product ID" };
            }
    
            // Process the images array if it exists in updateData
            if (updateData.image && Array.isArray(updateData.image)) {
                // Filter out base64 images that need to be uploaded
                const base64Images = updateData.image.filter(img => 
                    typeof img === 'string' && img.startsWith('data:image')
                );
    
                // Clean any existing URLs to remove signed parameters
                const existingUrls = updateData.image
                    .filter(img => typeof img === 'string' && !img.startsWith('data:image'))
                    .map(this.cleanUrl); // Clean each URL to remove signed parameters
    
                // Upload all base64 images at once using the proper function
                let uploadedUrls = [];
                if (base64Images.length > 0) {
                    uploadedUrls = await uploadMultipleImagesToGCS(base64Images, id, 'product');
                }
    
                // Combine existing URLs with newly uploaded URLs
                updateData.image = [...existingUrls, ...uploadedUrls];
            }
    
            const filter = { _id: new ObjectId(id) };
            const update = { $set: updateData };
    
            const result = await dbOperation.executeMongoQuery(tableName, 'update', { filter, update });
    
            if (result.modifiedCount > 0) {
                return { success: true, message: "Product updated successfully", data: result };
            } else {
                return { success: false, message: "No changes made or product not found" };
            }
        } catch (error) {
            console.error("Error updating product:", error);
            return { success: false, error: error.message };
        }
    },
    
    


    displayProduct: async function (lastId = null, limit = 6) {
        try {
            let query = {};
            
            // If lastId is provided, fetch projects after this ID
            if (lastId) {
                // We need to use $lt instead of $gt since we're sorting in descending order
                query = { _id: { $lt: new ObjectId(lastId) } };
            }

            // Always use the same sort order (newest first)
            const options = { 
                limit: limit,
                sort: { _id: -1 } 
            };

            // Fetch the projects based on the query
            const products = await dbOperation.executeMongoQuery('Products', 'find', query, options);
            
            // Generate signed URLs for all product images
            const productsWithSignedUrls = await Promise.all(products.map(async (product) => {
                const productCopy = {...product};
                
                // Check if the product has images
                if (productCopy.image && Array.isArray(productCopy.image)) {
                    // Generate signed URLs for each image
                    productCopy.image = await Promise.all(
                        productCopy.image.map(imageUrl => generateSignedUrl(imageUrl))
                    );
                }
                
                return productCopy;
            }));
            
            return {
                success: true,
                data: productsWithSignedUrls,
                lastFetchedId: products.length > 0 ? products[products.length - 1]._id : null
            };

        } catch (error) {
            console.error("Error in displayProduct:", error);
            return { success: false, error: error.message };
        }
    },


    displayProductByID: async function (id, lastId = null, limit = 4) {
        try {
            let query = { categoryId: id }; // Filter by category ID

            // Apply pagination if lastId exists
            if (lastId) {
                query._id = { $lt: new ObjectId(lastId) };
            }

            const options = {
                limit: limit,
                sort: { _id: -1 } // Newest first
            };

            // Fetch products matching the category ID
            const products = await dbOperation.executeMongoQuery('Products', 'find', query, options);

            // Generate signed URLs for all product images
            const productsWithSignedUrls = await Promise.all(products.map(async (product) => {
                const productCopy = { ...product };

                // Check if the product has images
                if (productCopy.image && Array.isArray(productCopy.image)) {
                    // Generate signed URLs for each image
                    productCopy.image = await Promise.all(
                        productCopy.image.map(imageUrl => generateSignedUrl(imageUrl))
                    );
                }

                return productCopy;
            }));

            return {
                success: true,
                data: productsWithSignedUrls,
                lastFetchedId: products.length > 0 ? products[products.length - 1]._id : null
            };

        } catch (error) {
            console.error("Error in displayProductByID:", error);
            return { success: false, error: error.message };
        }
    },

    deleteProduct: async function (ids) {
        try {
            const tableName = 'Products';
    
            if (!ids || (Array.isArray(ids) && ids.length === 0)) {
                return { success: false, message: 'No valid IDs provided for deletion' };
            }
    
            let filter;
    
            if (Array.isArray(ids)) {
                const validIds = ids.filter(id => ObjectId.isValid(id)).map(id => new ObjectId(id));
    
                if (validIds.length === 0) {
                    return { success: false, message: 'No valid ObjectIds provided' };
                }
    
                filter = { _id: validIds }; // **(OLD BUG: Missing `$in` fixed below!)**
            } else {
                if (!ObjectId.isValid(ids)) {
                    return { success: false, message: 'Invalid ObjectId provided' };
                }
    
                filter = { _id: new ObjectId(ids) };
            }
    
            const result = await dbOperation.executeMongoQuery(tableName, 'delete', { filter });
    
            if (result.deletedCount > 0) {
                return { success: true, message: `${result.deletedCount} products(s) deleted successfully`, data: result };
            } else {
                return { success: false, message: 'No products found to delete' };
            }
        } catch (error) {
            console.error('Error deleting product:', error);
            return { success: false, error: error.message };
        }
    },






    addProject:async function (projectName,projectDescription,categoryId,ProjectCode,isVisible,isTrending,image,brand,categoryName) {
        try{
            const images = await uploadMultipleImagesToGCS(image,categoryId,"project");
            const category={projectName,projectDescription,categoryId,ProjectCode,isVisible,isTrending,images,brand,categoryName}
            const result= await dbOperation.executeMongoQuery('Projects','insert',[category]);
            return { success: true, data: result };

        }catch(e){
            return { success: false, error: error.message };
        }
        
    },

    displayProject: async function (lastId = null, limit = 6) {
        try {
            let query = {};
            
            // If lastId is provided, fetch projects after this ID
            if (lastId) {
                // We need to use $lt instead of $gt since we're sorting in descending order
                query = { _id: { $lt: new ObjectId(lastId) } };
            }
    
            // Always use the same sort order (newest first)
            const options = { 
                limit: limit,
                sort: { _id: -1 } 
            };
    
            // Fetch the projects based on the query
            const projects = await dbOperation.executeMongoQuery('Projects', 'find', query, options);
            
            // Generate signed URLs for all product images
            const projectsWithSignedUrls = await Promise.all(projects.map(async (project) => {
                const projectCopy = {...project};
                
                // Check if the product has images
                if (projectCopy.images && Array.isArray(projectCopy.images)) {
                    // Generate signed URLs for each image
                    projectCopy.images = await Promise.all(
                        projectCopy.images.map(imageUrl => generateSignedUrl(imageUrl))
                    );
                }
                
                return projectCopy;
            }));
            
            return {
                success: true,
                data: projectsWithSignedUrls,
                lastFetchedId: projects.length > 0 ? projects[projects.length - 1]._id : null
            };
    
        } catch (error) {
            console.error("Error in displayProduct:", error);
            return { success: false, error: error.message };
        }
    },

    displayProjectByID: async function (id, lastId = null, limit = 4) {
        try {
            let query = { categoryId: id }; // Filter by category ID
    
            // Apply pagination if lastId exists
            if (lastId) {
                query._id = { $lt: new ObjectId(lastId) };
            }
    
            const options = {
                limit: limit,
                sort: { _id: -1 } // Newest first
            };
    
            // Fetch projects matching the category ID
            const projects = await dbOperation.executeMongoQuery('Projects', 'find', query, options);
    
            // Generate signed URLs for all project images
            const projectsWithSignedUrls = await Promise.all(projects.map(async (project) => {
                const projectCopy = { ...project };
    
                // Check if the project has images
                if (projectCopy.images && Array.isArray(projectCopy.images)) {
                    // Generate signed URLs for each image
                    projectCopy.images = await Promise.all(
                        projectCopy.images.map(imageUrl => generateSignedUrl(imageUrl))
                    );
                }
    
                return projectCopy;
            }));
    
            return {
                success: true,
                data: projectsWithSignedUrls,
                lastFetchedId: projects.length > 0 ? projects[projects.length - 1]._id : null
            };
    
        } catch (error) {
            console.error("Error in displayProjectByID:", error);
            return { success: false, error: error.message };
        }
    },
    
    


    deleteProject: async function (ids) {
        try {
            const tableName = 'Projects';
    
            if (!ids || (Array.isArray(ids) && ids.length === 0)) {
                return { success: false, message: 'No valid IDs provided for deletion' };
            }
    
            let filter;
    
            if (Array.isArray(ids)) {
                const validIds = ids.filter(id => ObjectId.isValid(id)).map(id => new ObjectId(id));
    
                if (validIds.length === 0) {
                    return { success: false, message: 'No valid ObjectIds provided' };
                }
    
                filter = { _id: validIds }; // **(OLD BUG: Missing `$in` fixed below!)**
            } else {
                if (!ObjectId.isValid(ids)) {
                    return { success: false, message: 'Invalid ObjectId provided' };
                }
    
                filter = { _id: new ObjectId(ids) };
            }
    
            const result = await dbOperation.executeMongoQuery(tableName, 'delete', { filter });
    
            if (result.deletedCount > 0) {
                return { success: true, message: `${result.deletedCount} project(s) deleted successfully`, data: result };
            } else {
                return { success: false, message: 'No projects found to delete' };
            }
        } catch (error) {
            console.error('Error deleting project:', error);
            return { success: false, error: error.message };
        }
    },
    
    cleanUrl:function(url) {
        if (typeof url !== 'string') return url;
        
        // If URL contains a question mark, it's likely a signed URL
        // Extract just the base URL part before the question mark
        const questionMarkIndex = url.indexOf('?');
        if (questionMarkIndex !== -1) {
            return url.substring(0, questionMarkIndex);
        }
        
        return url;
    },
    
    // Updated editProject function
    editProject: async function (id, updateData) {
        try {
            const tableName = 'Projects';
            
            if (!ObjectId.isValid(id)) {
                return { success: false, message: "Invalid Project ID" };
            }
            
            // Process the images array if it exists in updateData
            if (updateData.images && Array.isArray(updateData.images)) {
                // Filter out base64 images that need to be uploaded
                const base64Images = updateData.images.filter(img => 
                    typeof img === 'string' && img.startsWith('data:image')
                );
                
                // Clean any existing URLs to remove signed parameters
                const existingUrls = updateData.images
                    .filter(img => typeof img === 'string' && !img.startsWith('data:image'))
                    .map(this.cleanUrl); // Clean each URL to remove signed parameters
                
                // Upload all base64 images at once using the proper function
                let uploadedUrls = [];
                if (base64Images.length > 0) {
                    uploadedUrls = await uploadMultipleImagesToGCS(base64Images, id, 'project');
                }
                
                // Combine existing URLs with newly uploaded URLs
                updateData.images = [...existingUrls, ...uploadedUrls];
            }
            
            const filter = { _id: new ObjectId(id) };
            const update = { $set: updateData };
            
            const result = await dbOperation.executeMongoQuery(tableName, 'update', { filter, update });
            
            if (result.modifiedCount > 0) {
                return { success: true, message: "Project updated successfully", data: result };
            } else {
                return { success: false, message: "No changes made or project not found" };
            }
        } catch (error) {
            console.error("Error updating project:", error);
            return { success: false, error: error.message };
        }
    },
    
    



    displayBrand:async function () {
        try{
            const result = await dbOperation.executeMongoQuery('Products', 'distinct', { field: 'brand' });
            return { success: true, data: result };

        }catch(e){
            return { success: false, error: error.message };
        }
        
    },


    fetchTrending:async function () {
        try{
            const query = { isTrending: true }
            const result= await dbOperation.executeMongoQuery('projects','find',query);
            return { success: true, data: result };

        }catch(e){
            return { success: false, error: error.message };
        }
        
    },

    addBannerImage: async function(bannerName,bannerDescription,defaultImg) {
        try {
            const defaultImage= await uploadImageToGCS(defaultImg,"Banner")
            const category={bannerName,bannerDescription,defaultImage}
            const result = await dbOperation.executeMongoQuery('BannerTable', 'insert', [category]);
            return { success: true, data: result };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },

    fetchBannerImage: async function () {
        try {
            
            const result = await dbOperation.executeMongoQuery('BannerTable', 'find', {});
    
            // Generate signed URLs for defaultImage
            const bannersWithSignedUrls = await Promise.all(result.map(async (banner) => {
                const bannerCopy = { ...banner };
    
                if (bannerCopy.defaultImage) {
                    bannerCopy.defaultImage = await generateSignedUrl(bannerCopy.defaultImage);
                }
    
                return bannerCopy;
            }));
    
            return { success: true, data: bannersWithSignedUrls };
        } catch (error) {
            console.error("Error in fetchBannerImage:", error);
            return { success: false, error: error.message };
        }
    },
    editBannerImage: async function (id, bannerName, bannerDescription, defaultImage) {
        try {
            const tableName = 'BannerTable';
    
            if (!ObjectId.isValid(id)) {
                return { success: false, message: "Invalid Banner ID" };
            }
    
            let updatedImage = defaultImage;
    
            // Process the defaultImage field if it's a base64 image
            if (defaultImage && typeof defaultImage === 'string') {
                if (defaultImage.startsWith('data:image')) {
                    // Upload base64 image and get the uploaded URL
                    const uploadedUrl = await uploadImageToGCS(defaultImage, 'Banner');
                    updatedImage = uploadedUrl; // Ensure correct assignment
                } else {
                    // Clean the existing URL to remove signed parameters
                    updatedImage = this.cleanUrl(defaultImage);
                }
            }
    
            const filter = { _id: new ObjectId(id) };
            const updateFields = {};
    
            // Only update fields if they exist
            if (bannerName) updateFields.bannerName = bannerName;
            if (bannerDescription) updateFields.bannerDescription = bannerDescription;
            if (updatedImage) updateFields.defaultImage = updatedImage;
    
            if (Object.keys(updateFields).length === 0) {
                return { success: false, message: "No valid fields to update" };
            }
    
            const update = { $set: updateFields };
    
            const result = await dbOperation.executeMongoQuery(tableName, 'update', { filter, update });
    
            if (result.modifiedCount > 0) {
                return { success: true, message: "Banner updated successfully", data: result };
            } else {
                return { success: false, message: "No changes made or banner not found" };
            }
        } catch (error) {
            console.error("Error updating banner:", error);
            return { success: false, error: error.message };
        }
    },

    fetchTrendingImage: async function (type) {
        try {
            // Select the collection based on the type (project or product)
            const collection = type === 'project' ? 'Projects' : 'Products';
            
            // Find all the items where isVisible is true
            const result = await dbOperation.executeMongoQuery(collection, 'find', { isVisible: true });
    
            // Generate signed URLs for images
            const itemsWithSignedUrls = await Promise.all(result.map(async (item) => {
                const itemCopy = { ...item };
    
                // If the item has an image, generate the signed URL for it
                if (itemCopy.image) {
                    itemCopy.image = await generateSignedUrl(itemCopy.image);
                }
                
                // If it is a project, check for other image properties like 'images'
                if (type === 'project' && itemCopy.images) {
                    itemCopy.images = await Promise.all(itemCopy.images.map(async (img) => {
                        return await generateSignedUrl(img);
                    }));
                }
    
                return itemCopy;
            }));
    
            return { success: true, data: itemsWithSignedUrls };
        } catch (error) {
            console.error("Error in fetchTrendingImage:", error);
            return { success: false, error: error.message };
        }
    },

    getSimilarProjects: async function (categoryId, currentProjectId = null) {
        try {
            let query = { categoryId };
    
            if (currentProjectId) {
                query._id = { $ne: new ObjectId(currentProjectId) };
            }
    
            const options = {
                limit: 4,
                sort: { _id: -1 }
            };
    
            const projects = await dbOperation.executeMongoQuery('Projects', 'find', query, options);
    
            const projectsWithSignedUrls = await Promise.all(projects.map(async (project) => {
                const projectCopy = { ...project };
    
                if (projectCopy.images && Array.isArray(projectCopy.images)) {
                    projectCopy.images = await Promise.all(
                        projectCopy.images.map(imageUrl => generateSignedUrl(imageUrl))
                    );
                }
    
                return projectCopy;
            }));
    
            return {
                success: true,
                data: projectsWithSignedUrls
            };
    
        } catch (error) {
            console.error("Error in getSimilarProjects:", error);
            return { success: false, error: error.message };
        }
    },

    
    getSimilarProducts: async function (categoryId, currentProductId = null) {
        try {
            let query = { categoryId };
    
            if (currentProductId) {
                query._id = { $ne: new ObjectId(currentProductId) };
            }
    
            const options = {
                limit: 4,
                sort: { _id: -1 }
            };
    
            const projects = await dbOperation.executeMongoQuery('Projects', 'find', query, options);
    
            const projectsWithSignedUrls = await Promise.all(projects.map(async (project) => {
                const projectCopy = { ...project };
    
                if (projectCopy.images && Array.isArray(projectCopy.images)) {
                    projectCopy.images = await Promise.all(
                        projectCopy.images.map(imageUrl => generateSignedUrl(imageUrl))
                    );
                }
    
                return projectCopy;
            }));
    
            return {
                success: true,
                data: projectsWithSignedUrls
            };
    
        } catch (error) {
            console.error("Error in getSimilarProjects:", error);
            return { success: false, error: error.message };
        }
    }
    
    

}