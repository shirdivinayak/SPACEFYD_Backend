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


    addCategory: async function(id,name,image) {
        try {
            const category={id,name,image}
            const result = await dbOperation.executeMongoQuery('SPACEFYD', 'insert', [category]);
            return { success: true, data: result };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },

    deleteCategory:async function (id) {
        try{
            const category={id}
            const result= await dbOperation.executeMongoQuery('SPACEFYD','delete',category);
            return { success: true, data: result };

        }catch(e){
            return { success: false, error: error.message };
        }
        
    },

    displayCategory:async function () {
        try{
           
            const result= await dbOperation.executeMongoQuery('SPACEFYD','find',{});
            return { success: true, data: result };

        }catch(e){
            return { success: false, error: error.message };
        }
        
    },

    displayCategoryById:async function (id) {
        try{
           const category={id}
            const result= await dbOperation.executeMongoQuery('SPACEFYD','find',{category});
            return { success: true, data: result };

        }catch(e){
            return { success: false, error: error.message };
        }
        
    },

    addProduct:async function (name,description,categoryId,productCode,brand,image) {
        try{
            const category={name,description,categoryId,productCode,brand,image}
            const result= await dbOperation.executeMongoQuery('SPACEFYD','insert',[category]);
            return { success: true, data: result };

        }catch(e){
            return { success: false, error: error.message };
        }
        
    },

    displayProduct:async function () {
        try{
            const result= await dbOperation.executeMongoQuery('SPACEFYD','find',{});
            return { success: true, data: result };

        }catch(e){
            return { success: false, error: error.message };
        }
        
    },

    displayProductByID:async function (id) {
        try{
            const category=id
            const result= await dbOperation.executeMongoQuery('SPACEFYD','find',{category});
            return { success: true, data: result };

        }catch(e){
            return { success: false, error: error.message };
        }
        
    },


    addProject:async function (projectName,projectDescription,categoryId,isVisible) {
        try{
            const category={projectName,projectDescription,categoryId,isVisible}
            const result= await dbOperation.executeMongoQuery('SPACEFYD','insert',[category]);
            return { success: true, data: result };

        }catch(e){
            return { success: false, error: error.message };
        }
        
    },

    displayProject:async function () {
        try{
            const result= await dbOperation.executeMongoQuery('SPACEFYD','find',{});
            return { success: true, data: result };

        }catch(e){
            return { success: false, error: error.message };
        }
        
    },

    displayProjectByID:async function (id) {
        try{
            const category=id
            const result= await dbOperation.executeMongoQuery('SPACEFYD','find',{category});
            return { success: true, data: result };

        }catch(e){
            return { success: false, error: error.message };
        }
        
    },

    addBrand:async function (brandName,image) {
        try{
            const category={brandName,image}
            const result= await dbOperation.executeMongoQuery('SPACEFYD','find',[category]);
            return { success: true, data: result };

        }catch(e){
            return { success: false, error: error.message };
        }
        
    },
    
    

    

 }