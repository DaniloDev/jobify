const express = require('express')
const app = express()

const sqlite = require('sqlite')
const sqlite3 = require('sqlite3')

const dbConnection = sqlite.open({
    filename : './banco.sqlite',
    driver: sqlite3.Database
}, { Promise})

const path = require('path')

const port = process.env.PORT || 3000

app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')
app.use(express.static('public'))
app.use(express.urlencoded({ extended: true }))

app.get('/', async(req, res) =>{
    const db = await dbConnection
    const categoriasDb = await db.all('select * from categorias;')
    const vagas = await db.all('select * from vagas;')
    const categorias = categoriasDb.map(cat => {
        return {
            ...cat,
            vagas: vagas.filter( vaga => vaga.categoria === cat.id)
        }
    })
    //console.log(JSON.stringify(categorias))
 res.render('home', {
    categorias
  })
 
})

app.get('/vaga/:id', async(req, res) =>{
    const db = await dbConnection
    const vaga = await db.get(`select * from vagas where id ='${req.params.id}';`)
    const cat = await db.get(`select categoria from categorias where id ='${vaga.categoria}';`)

    res.render('vaga', {
        vaga,
        categoria: cat.categoria
    })
    
   })

   
app.get('/admin', async(req, res) => {

    res.render('admin/home')
})


app.get('/admin/vagas', async(req, res) => {
    const db = await dbConnection
    const vagas = await db.all('select * from vagas')
    res.render('admin/vagas', { vagas })
})


app.get('/admin/vagas/delete/:id', async(req, res) => {
    const db = await dbConnection
    await db.run('delete from vagas where id ='+req.params.id)
    res.redirect('/admin/vagas')
})

app.get('/admin/vagas/nova', async(req, res) => {
    const db = await dbConnection
    const categorias = await db.all('select * from categorias;')
    res.render('admin/nova-vaga', {
        categorias
  })
})

app.post('/admin/vagas/nova', async(req, res) => {
    const { categoria, titulo, descricao } = req.body
    const db = await dbConnection
    await db.run(`insert into vagas(categoria, titulo, descricao) values('${categoria}', '${titulo}', '${descricao}')`)
    res.redirect('/admin/vagas')
})



app.get('/admin/vagas/editar/:id', async(req, res) => {
    const db = await dbConnection
    const vaga = await db.get(`select * from vagas where id ='${req.params.id}';`)
    const categorias = await db.all('select * from categorias;')
    res.render('admin/editar-vaga', {
      vaga,
      categorias
  })
})


app.post('/admin/vagas/editar/:id', async(req, res) => {
    const { categoria, titulo, descricao } = req.body
    const { id } = req.params
    const db = await dbConnection
    await db.run(`update vagas set categoria = ${categoria}, titulo='${titulo}', descricao='${descricao}' where id = ${id};`)
    res.redirect('/admin/vagas')
})

// CRUD CATEGORIAS

app.get('/admin/categorias', async(req, res) => {
    const db = await dbConnection
    const categorias = await db.all('select * from categorias')
    res.render('admin/categorias', { categorias })
})


app.get('/admin/categorias/delete/:id', async(req, res) => {
    const db = await dbConnection
    await db.run('delete from categorias where id ='+req.params.id)
    res.redirect('/admin/categorias')
})


app.get('/admin/categorias/nova', async(req, res) => {
    res.render('admin/nova-categoria')
})

app.post('/admin/categorias/nova', async(req, res) => {
    const { categoria } = req.body
    const db = await dbConnection
    await db.run(`insert into categorias(categoria) values('${categoria}')`)
    res.redirect('/admin/categorias')
})


app.get('/admin/categorias/editar/:id', async(req, res) => {
    const db = await dbConnection
    const cat = await db.get(`select * from categorias where id ='${req.params.id}';`)
    res.render('admin/editar-categoria', {
      cat
  })
})


app.post('/admin/categorias/editar/:id', async(req, res) => {
    const { categoria } = req.body
    const { id } = req.params
    const db = await dbConnection
    await db.run(`update categorias set categoria = '${categoria}' where id = ${id};`)
    res.redirect('/admin/categorias')
})

const init =  async() => {
    const db = await dbConnection
    await db.run('create table if not exists categorias (id INTEGER PRIMARY KEY, categoria TEXT);')
    await db.run('create table if not exists vagas (id INTEGER PRIMARY KEY, categoria INTEGER, titulo TEXT, descricao TEXT);')
    //Engineering team Marketing team
    /*const categoria = 'Marketing team'
    await db.run(`insert into categorias(categoria) values('${categoria}')`)*/

    /*const vaga = 'Engenheiro'
    const descricao = 'Vaga para Engenheiro'
    await db.run(`insert into vagas(categoria, titulo, descricao) values(2, '${vaga}', '${descricao}')`)* */

}    

init()
app.listen(port, (err) =>{
    if(err){
        console.log('N??o foi possivel iniciar o servidor do Jobify.')
    }else{
        console.log('Servidor do Jobify rodando...')
    }
})