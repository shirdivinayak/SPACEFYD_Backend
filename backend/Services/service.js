const dbOperation=require('../Database/dbOperations')

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


    addCategory: async function(name) {
        try {
            const category={name}
            const result = await dbOperation.executeMongoQuery('Categories', 'insert', [category]);
            return { success: true, data: result };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },

    deleteCategory:async function (id) {
        try{
            const category={id}
            const result= await dbOperation.executeMongoQuery('Categories','delete',category);
            return { success: true, data: result };

        }catch(e){
            return { success: false, error: error.message };
        }
        
    },

    displayCategory:async function () {
        try{
           
            const result= await dbOperation.executeMongoQuery('Categories','find',{});
            return { success: true, data: result };

        }catch(e){
            return { success: false, error: error.message };
        }
        
    },


    displayCategoryById:async function (id) {
        try{
           const category={id}
            const result= await dbOperation.executeMongoQuery('Categories','find',{category});
            return { success: true, data: result };

        }catch(e){
            return { success: false, error: error.message };
        }
        
    },

    addProduct:async function (productName,description,categoryName,productCode,brand,image,isVisible,isTrending) {
        try{
            const category={productName,description,categoryName,productCode,brand,image,isVisible,isTrending}
            const result= await dbOperation.executeMongoQuery('Products','insert',[category]);
            return { success: true, data: result };

        }catch(e){
            return { success: false, error: error.message };
        }
        
    },

    displayProduct:async function () {
        try{
            const result= await dbOperation.executeMongoQuery('Products','find',{});
            return { success: true, data: result };

        }catch(e){
            return { success: false, error: error.message };
        }
        
    },

    displayProductByID:async function (id) {
        try{
            const category=id
            const result= await dbOperation.executeMongoQuery('Products','find',{category});
            return { success: true, data: result };

        }catch(e){
            return { success: false, error: error.message };
        }
        
    },


    addProject:async function (projectName,projectDescription,categoryName,ProjectCode,isVisible) {
        try{
            const category={projectName,projectDescription,categoryName,ProjectCode,isVisible}
            const result= await dbOperation.executeMongoQuery('Projects','insert',[category]);
            return { success: true, data: result };

        }catch(e){
            return { success: false, error: error.message };
        }
        
    },

    displayProject:async function () {
        try{
            const result= await dbOperation.executeMongoQuery('Projects','find',{});
            console.log(result)
            return result ;

        }catch(e){
            return { success: false, error: error.message };
        }
        
    },

    displayProjectByID:async function (id) {
        try{
            const category=id
            const result= await dbOperation.executeMongoQuery('Projects','find',{category});
            return { success: true, data: result };

        }catch(e){
            return { success: false, error: error.message };
        }
        
    },

    addBrand:async function (brandName,image) {
        try{
            const category={brandName,image}
            const result= await dbOperation.executeMongoQuery('Brand','find',[category]);
            return { success: true, data: result };

        }catch(e){
            return { success: false, error: error.message };
        }
        
    },
 }