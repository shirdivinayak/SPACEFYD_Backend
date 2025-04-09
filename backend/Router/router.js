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

router.post('/check',async(req,res)=>{
    try{
        const{input}=req.body;
        const result=input
        res.send(result)

    }catch(e){
        console.log(e)

    }
})



router.post('/addCategory',async(req,res)=>{
    try{
        const{name,image,type}=req.body;
        const result= await service.addCategory(name,image,type)
        res.send(result)

    }catch(e){
        console.log(e)

    }
})

router.post('/editCategory',async(req,res)=>{
    try{
        const{name,type,id,image}=req.body;
        const result= await service.editCategory(id,name,type,image)
        res.send(result)

    }catch(e){
        console.log(e)

    }
})


router.post('/deleteCategory',async (req,res) => {

    try{
        const {id,type}=req.body
        const result=await service.deleteCategory(id,type)
        res.send(result)


    }catch(e){
        console.log(e)
    }
    
})


router.post('/displayCategory',async (req,res) => {

    try{
        console.log("api called")
        const result=await service.displayCategory(req.body.type)
        res.send(result)


    }catch(e){
        console.log(e)
    }
    
})

router.post('/displayCategoryById',async (req,res) => {

    try{
        const {id,type}=req.body
        const result=await service.displayCategoryById(id,type)
        res.send(result)


    }catch(e){
        console.log(e)
    }
    
})

router.post('/addSubCategory',async(req,res)=>{
    try{
        const{name,categoryId}=req.body;
        const result= await service.addSubCategory(name,categoryId)
        res.send(result)

    }catch(e){
        console.log(e)

    }
})   

router.post('/editSubCategory',async(req,res)=>{
    try{
        const{name,id}=req.body;
        const result= await service.editSubCategory(id,name,type)
        res.send(result)

    }catch(e){
        console.log(e)

    }
})

router.post('/deleteSubCategory',async (req,res) => {

    try{
        const {id}=req.body
        const result=await service.deleteSubCategory(id)
        res.send(result)


    }catch(e){
        console.log(e)
    }
    
})


router.post('/displaySubCategory',async (req,res) => {

    try{
       
        const result=await service.displaySubCategory()
        res.send(result)


    }catch(e){
        console.log(e)
    }
    
})   

router.post('/displaySubCategoryById',async (req,res) => {

    try{
        const {id}=req.body
        const result=await service.displaySubCategoryById(id)
        res.send(result)


    }catch(e){
        console.log(e)
    }
    
})

router.post('/addProduct',async (req,res) => {

    try{
        const {productName,description,categoryId,subCategoryId,productCode,brand,image,isVisible,isTrending,categoryName,subcategoryName}=req.body
        const result=await service.addProduct(productName,description,categoryId,subCategoryId,productCode,brand,image,isVisible,isTrending,categoryName,subcategoryName)
        res.send(result)
    }catch(e){
        console.log(e)
    }
    
})

router.post('/editProduct', async (req, res) => {
    try {

        const { id, productName, productDescription, categoryId, ProductCode, brand, image, isVisible, categoryName,subcategoryName } = req.body;

        if (!id) {
            return res.status(400).json({ success: false, message: "Project ID is required" });
        }

        const result = await service.editProduct(id, {productName, productDescription, categoryId, ProductCode, brand, image, isVisible, categoryName,subcategoryName});

        res.send(result);
    } catch (e) {
        console.error("Error in /editProject:", e);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
})

router.post('/displayProduct',async (req,res) => {

    try{
        const{lastId}=req.body
        const result=await service.displayProduct(lastId)
        res.send(result)
        
    }catch(e){
        console.log(e)
    }
    
})

router.post('/displayProductByID',async (req,res) => {

    try{
        const{categoryId,lastId}=req.body
        const result=await service.displayProductByID(categoryId,lastId)
        res.send(result)
    }catch(e){
        console.log(e)
    }6
    
})
router.post('/deleteProduct',async (req,res) => {

    try{
        const {id}=req.body
        const result=await service.deleteProduct(id)
        res.send(result)


    }catch(e){
        console.log(e)
    }
    
})




router.post('/addProject',async (req,res) => {

    try{
        const{projectName,projectDescription,categoryId,ProjectCode,isVisible,isTrending,images,brand,categoryName}=req.body
        const result=await service.addProject(projectName,projectDescription,categoryId,ProjectCode,isVisible,isTrending,images,brand,categoryName)
        res.send(result)
    }catch(e){
        console.log(e)
    }
    
})

router.post('/displayProject',async (req,res) => {

    try{
        const{lastId}=req.body
        const result=   await service.displayProject(lastId)
        res.    send(result)
    }catch(e){
        console.log(e)
    }
    
})

router.post('/displayProjectByID',async (req,res) => {

    try{
        const{categoryId,lastId}=req.body
        const result=await service.displayProjectByID(categoryId,lastId)
        res.send(result)
    }catch(e){
        console.log(e)
    }6
    
})

router.post('/deleteProject',async (req,res) => {

    try{
        const {id}=req.body
        const result=await service.deleteProject(id)
        res.send(result)


    }catch(e){
        console.log(e)
    }
    
})

router.post('/editProject', async (req, res) => {
    try {

        const { id, projectName, projectDescription, categoryId, ProjectCode, brand, images, isVisible, categoryName } = req.body;

        if (!id) {
            return res.status(400).json({ success: false, message: "Project ID is required" });
        }

        const result = await service.editProject(id, {projectName, projectDescription, categoryId,ProjectCode, brand, images, isVisible, categoryName});

        res.send(result);
    } catch (e) {
        console.error("Error in /editProject:", e);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
})


router.post('/displayBrand',async (req,res) => {
    try{
        const result=   await service.displayBrand()
        res.send(result)
    }catch(e){
        console.log(e)
    }
    
})

router.post('/fetchTrending',async (req,res) => {

    try{
        const result=await service.fetchTrending()
        res.send(result)
    }catch(e){
        console.log(e)
    }
    
})

router.post('/addBannerImage',async (req,res) => {

    try{
        const { bannerName,bannerDescription,defaultImage } = req.body;
        const result=await service.addBannerImage(bannerName,bannerDescription,defaultImage)
        res.send(result)
    }catch(e){
        console.log(e)
    }
    
})

router.post('/fetchBannerImage',async (req,res) => {

    try{
        const result=await service.fetchBannerImage()
        res.send(result)
    }catch(e){
        console.log(e)
    }
    
})

router.post('/editBannerImage', async (req, res) => {
    try {

        const { id,bannerName,bannerDescription,defaultImage } = req.body;

        if (!id) {
            return res.status(400).json({ success: false, message: "Project ID is required" });
        }

        const result = await service.editBannerImage(id,bannerName,bannerDescription,defaultImage);

        res.send(result);
    } catch (e) {
        console.error("Error in /editProject:", e);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
})


router.post('/fetchTrendingImage',async (req,res) => {

    try{
        const result=await service.fetchTrendingImage(req.body.type)
        res.send(result)
    }catch(e){
        console.log(e)
    }
    
})



router.post('/fetchSimillarProjects',async (req,res) => {

    try{
        const result=await service.getSimilarProjects(req.body.categoryId,req.body.id)
        res.send(result)
    }catch(e){
        console.log(e)
    }
    
})

router.post('/fetchSimillarProducts',async (req,res) => {

    try{
        const result=await service.getSimilarProducts(req.body.categoryId,req.body.id)
        res.send(result)
    }catch(e){
        console.log(e)
    }
    
})



module.exports=router;