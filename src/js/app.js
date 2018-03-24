let app = new Vue({ el: '#app',
  data: {
    editingName: false, loginVisible: false, signUpVisible: false, shareVisible: false,skinPickerVisible:false,

 
    currentUser: {
      objectId: undefined,
      email: '',
 
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
    hasLogout () {
      return !!this.currentUser.objectId
    },
    hasLogin() {
      return !!!this.currentUser.objectId
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
    print(){
      window.print()
    },
    setTheme(name) {
      document.body.className = name
    }
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


