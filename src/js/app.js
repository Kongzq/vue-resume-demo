let app = new Vue({ el: '#app',
  data: {
    editingName: false, loginVisible: false, signUpVisible: false, shareVisible: false,
    previewUser: {
      objectId: undefined,
    },
    previewResume: {},
    currentUser: {
      objectId: undefined,
      email: '',
      fuck: 'fuck'
    },
    resume: {
      name: '姓名',
      gender: '女',
      birthday: '1990年1月',
      jobTitle: '前端工程师',
      phone: '138111111111',
      email: 'example@example.com',
      skills: [
        {name: '请填写技能名称', description: '请填写技能描述'},
        {name: '请填写技能名称', description: '请填写技能描述'},
        {name: '请填写技能名称', description: '请填写技能描述'},
        {name: '请填写技能名称', description: '请填写技能描述'},
      ],
      projects: [
        {name: '请填写项目名称', link: 'http://...', keywords: '请填写关键词', description: '请详细描述'},
        {name: '请填写项目名称', link: 'http://...', keywords: '请填写关键词', description: '请详细描述'},
      ]
    },
    login: {
      email: '',
      password: ''
    },
    signUp: {
      email: '',
      password: ''
    },
    shareLink: '不知道',
    mode: 'edit' // 'preview'
  },
  computed: {
    displayResume () {
      return this.mode === 'preview' ? this.previewResume : this.resume
    }
  },
  watch: {
    'currentUser.objectId': function (newValue, oldValue) {
      if (newValue) {
        this.getResume(this.currentUser)
      }
    }
  },
  methods: {
    onEdit(key, value){
       

     

      let regex = /\[(\d+)\]/g
      key = key.replace(regex, (match, number) => `.${number}`)
      // key = skills.0.name
      keys = key.split('.')
      let result = this.resume
      for (let i = 0; i < keys.length; i++) {
        if (i === keys.length - 1) {
          result[keys[i]] = value
        } else {
          result = result[keys[i]]
        }
      }
    },
    hasLogin () {
      return !!this.currentUser.objectId
    },
    onLogin(e){
      AV.User.logIn(this.login.email, this.login.password).then((user) => {  
  
        // 登录后会把登录信息存在localstorage
        user = user.toJSON()  
        this.currentUser.objectId = user.objectId
        this.currentUser.email = user.email
        this.loginVisible = false
      }, (error) => {
        if (error.code === 211) {

          alert('邮箱不存在')
        } else if (error.code === 210) {
          alert('邮箱和密码不匹配')
        }
      })
    },
    onLogout(e){
      AV.User.logOut();  //会把存在localstorage的登录信息删除,currentUser被销毁
      alert('注销成功')
    
      window.location.reload() 
    },
    onSignUp(e){
      const user = new AV.User()
      user.setUsername(this.signUp.email)
      user.setPassword(this.signUp.password)
      user.setEmail(this.signUp.email)
      user.signUp().then((user) => {
      
        alert('注册成功')
        user = user.toJSON() 
        this.currentUser.objectId = user.objectId
        this.currentUser.email = user.email
        this.signUpVisible = false
      }, (error) => {
        alert(error.rawMessage)
      })
    },
    onClickSave(){
      let currentUser = AV.User.current()
      if (!currentUser) {
        this.loginVisible = true
      } else {
        this.saveResume()
      }
    },
    saveResume(){
      let {objectId} = AV.User.current().toJSON()
      let user = AV.Object.createWithoutData('User', objectId)
      user.set('resume', this.resume)
      user.save().then(() => {
        alert('保存成功')
      }, () => {
        alert('保存失败')
      })
    },
    getResume (user) {
      var query = new AV.Query('User');
      return query.get(user.objectId).then((user) => {
        let resume = user.toJSON().resume    
        return resume
      }, (error) => {
        
      });
    },
    addSkill () {
      this.resume.skills.push({name: '请填写技能名称', description: '请填写技能描述'})
    },
    removeSkill (index) {
      this.resume.skills.splice(index, 1)
    },
    addProject () {
      this.resume.projects.push(
        {name: '请填写项目名称', link: 'http://...', keywords: '请填写关键词', description: '请详细描述'},
      )
    },
    removeProject (index) {
      this.resume.projects.splice(index, 1)
    },
  }
})



//获取当前用户
let currentUser = AV.User.current()
if (currentUser) {
  app.currentUser = currentUser.toJSON()  
  app.shareLink = location.origin + location.pathname + '?user_id=' + app.currentUser.objectId
  app.getResume(app.currentUser).then(resume => {
    app.resume = resume
  })
}


// 获取预览用户的 id
let search = location.search
let regex = /user_id=([^&]+)/
let matches = search.match(regex)
let userId
if (matches) {
  userId = matches[1]
  app.mode = 'preview'
  app.getResume({objectId: userId}).then(resume => {
    app.previewResume = resume
  })


}




// "打印"按钮的代码方方没给，看他的视频，他的做法就是
// 点击后执行window.print()，这样就会调用浏览器的打印功能
// 然后<link href='print.css' media=print>
// 在print.css把一些元素去掉，例如
// aside,.skills .remove
// {display:none;} 


// "换肤"按钮的代码方方没给，看他的视频，他的做法就是
// 在index.html的<main :class=mainClass>，点击换肤按钮弹出一个对话框，上面有2个按钮，一个写着“暗黑“，一个写着”默认“，
// 点击暗黑，执行setTheme('dark')，点击默认，执行setTheme('default') ，在app.js的data添加mainClass:default，methods添加setTheme（name） { this.mainClass=name}，然后在css写相应的样式



// 后来方方用vue-router实现点击保存按钮跳转到/login，渲染login组件，点击登录框的注册按钮跳转到/signup，渲染signup组件，这样就不需要用变量控制登录框和注册框的显隐，
// 但方方没给代码，大概看下“方方的路由”那个文件夹即可

// 后来方方把当前的代码用组件化的形式整理了一下，但代码没给，其实也很简单，把相应组件的option复制到一个文件,然后一些地方用父子组件的通信方式传递数据
// 具体看vue 毕设 - 简历制作工具 4，视频:模块化，07:20-22:50, <skinPicker></skinPicker>这样写其实并没有渲染组件，写成<skin-picker></skin-picker>才行
