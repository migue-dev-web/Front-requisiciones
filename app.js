import {createApp} from 'https://unpkg.com/vue@3/dist/vue.esm-browser.js'
const api ="https://administracion-de-requisiciones-it.onrender.com";
      const requisicion = {
        template: "#req",
        props: ["user"], 
        data() {
            return {
      problema: '',
      requisitor:this.user ? this.user.name : '',
      media: '',
      descripcion: '',
      ubicacion: '',
    };
        },
        emits:["logout"],
        methods: {
           async submitForm() {
      
      
      const payload= {
       problema:this.problema,
        requisitor:this.requisitor,
        media:this.media,
        descripcion:this.descripcion,
        ubicacion:this.ubicacion
      }

      try{
        const response = await fetch(`${api}/api/req`, {
          method: "POST",
          headers: {
            'Authorization': 'Bearer ' + localStorage.getItem("token"),
            "Content-Type": "application/json",
            "Accept": "application/json"
          },
          body: JSON.stringify(payload)
        });
        if (!response.ok) throw new Error("Error al enviar requisición");

        const data = await response.json();
        console.log("Requisición enviada:", data);
        location.reload();

      }catch(error){
         console.error(error);
        alert("Error al registrar requisición");
      }
    },
    logout(){
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        this.$emit("logout");
        location.reload();
    }
  }
    };

    const login={
        template: '#login',
        data(){
            return{
                email:"",
                password:""
            }
        },
        emits: ["loggedIn"],
        methods:{
            async envForm(){
                if (!this.email.trim() || !this.password.trim()) {
                alert("El correo y la contraseña no pueden estar vacíos ");
                return;
                }
                

        const payload = {
            email: this.email,
            password: this.password
        };

        try{
            const resp = await fetch(`${api}/api/login`,{
                method:'POST',
                headers:{
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                },
                body: JSON.stringify(payload),
            });

            if (!resp.ok) {
                throw new Error(`Error en la petición: ${response.status}`);
            }

            const data = await resp.json();
            console.log("Respuesta de la API:", data);

            if(data.token){
                localStorage.setItem("token",data.token);
                localStorage.setItem("user", JSON.stringify(data.user));
            }

            this.$emit("loggedIn", data.user);

        }catch(error)
        {
            console.error("Error al iniciar", error);
            alert("No se pudo iniciar sesion");
        }

            }
        }

    }

    const reg ={
        template:'#reg',
        data(){
            return{
                email:"",
                name:"",
                password:"",
                password_confirmation:""
            }
        },
        emits: ["registered"],
        methods:{
            async envForm(){
                if (!this.email.trim() || !this.password.trim()|| !this.password_confirmation.trim()){
                    alert("El correo y la contraseña no pueden estar vacíos ");
                }
                if (this.password !== this.password_confirmation) {
                alert("Las contraseñas no coinciden");
                return;
                }
                const payload ={
                    email:this.email,
                    name:this.name,
                    password:this.password,
                    password_confirmation:this.password_confirmation
                };

                try{
                    const resp = await fetch(`${api}/api/reg`,{
                        method:'POST',
                        headers:{
                            "Content-Type": "application/json",
                            "Accept": "application/json"
                        },
                        body: JSON.stringify(payload),
                    });

                    if (!resp.ok) {
                        throw new Error(`Error en la petición: ${response.status}`);
                    }
                    this.$emit("registered");

                }catch(error){
                        console.error("Error al registrar usuario:", error);
                        alert("No se pudo registrar el usuario");
                }
            }
        }
    }

    const reqlist ={
        template: '#reqTable',
        data(){
            return{
                requisiciones:[],
                currentUser: JSON.parse(localStorage.getItem("user")) || null
            }
        },
        mounted(){
            this.fetchReq();
        },
        methods: {
            async fetchReq(){
                try{
                    const resp = await fetch(`${api}/api/req/activas`,{
                        headers:{
                            'Authorization': 'Bearer ' + localStorage.getItem("token"),
                            "Accept": "application/json"
                        }
                    });
                    if(!resp.ok) throw new Error ('Error al cargar las requisiciones');

                    this.requisiciones = await resp.json();
                }catch (err){
                    console.error(err);
                    alert("Error al cargar las requisiciones");
                }
            },
            async cerrarReq(id){
                const currentUser = JSON.parse(localStorage.getItem("user"));
                if(!confirm("Cerrar requisicion?")) return;

                try{
                    const resp = await fetch(`${api}/api/req/${id}/finalizar`,{
                        method: "PUT", // o POST según tu API
                        headers: {
                            'Authorization': 'Bearer ' + localStorage.getItem("token"),
                            "Content-Type": "application/json",
                            "Accept": "application/json",
                        },
                        body: JSON.stringify({
                            tecnico: currentUser.name
                        })
                        
                    });

                    if (!resp.ok) throw new Error("Error al cerrar requisición");

                    const data = await resp.json();
                    console.log("Requisición cerrada:", data);

                     this.requisiciones = this.requisiciones.filter(r => r.id !== id);

                }catch(err){
                    console.error(err);
                    alert("Error al cerrar requisición");
                }
            }
        }
    }

    createApp({
        components: { 'requisicion': requisicion, 'login':login, 'registro':reg, 'tabler':reqlist },
        data(){
            return{
                hasToken: !!localStorage.getItem("token"),
                showRegister: false,
                currentUser: null,
            };
        },
        methods:{
            handleLogin(user){
                this.currentUser = user;
                this.hasToken = true;
            },
            handleLogout() {
      this.hasToken = false; 
    },
     handleRegistered() {
      this.showRegister = false;
    }
        }
    }).mount('#app');

