const createRouter=require('restify-router').Router;
const service=require('../Services/service')

const router=new createRouter();


router.post('/login',async(req,res)=>{
    try{
        const{username,password}=req.body;
        const result=await service.login(username,password)
        res.send(result)

    }catch(e){
        console.log(e)

    }
})



router.post('/addCategory',async(req,res)=>{
    try{
        const{name}=req.body;
        const result= await service.addCategory(name)
        res.send(result)

    }catch(e){
        console.log(e)

    }
})

router.post('/deleteCategory',async (req,res) => {

    try{
        const {id}=req.body
        const result=await service.deleteCategory(id)
        res.send(result)


    }catch(e){
        console.log(e)
    }
    
})


router.post('/displayCategory',async (req,res) => {

    try{
       
        const result=await service.displayCategory()
        res.send(result)


    }catch(e){
        console.log(e)
    }
    
})

router.post('/displayCategoryById',async (req,res) => {

    try{
        const {id}=req.body
        const result=await service.displayCategoryById(id)
        res.send(result)


    }catch(e){
        console.log(e)
    }
    
})

router.post('/addProduct',async (req,res) => {

    try{
        const {productName,description,categoryName,productCode,brand,image,isVisible,isTrending}=req.body
        const result=await service.addProduct(productName,description,categoryName,productCode,brand,image,isVisible,isTrending)
        res.send(result)
    }catch(e){
        console.log(e)
    }
    
})

router.post('/displayProduct',async (req,res) => {

    try{
    
        const result=await service.displayProduct()
        res.send(result)
        
    }catch(e){
        console.log(e)
    }
    
})


router.post('/addProject',async (req,res) => {

    try{
        const{projectName,projectDescription,categoryName,ProjectCode,isVisible}=req.body
        const result=await service.addProject(projectName,projectDescription,categoryName,ProjectCode,isVisible)
        res.send(result)
    }catch(e){
        console.log(e)
    }
    
})

router.post('/displayProject',async (req,res) => {

    try{
        const result=await service.displayProject()
        res.send(result)
    }catch(e){
        console.log(e)
    }
    
})

router.post('/displayProjectByID',async (req,res) => {

    try{
        const{id}=id
        const result=await service.displayProject(id)
        res.send(result)
    }catch(e){
        console.log(e)
    }
    
})

router.post('/addBrand',async (req,res) => {

    try{
        const{brandName,image}=req.body
        const result=await service.addBrand(brandName,image)
        res.send(result)
    }catch(e){
        console.log(e)
    }
    
})



module.exports=router;