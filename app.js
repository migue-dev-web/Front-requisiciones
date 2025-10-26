
import {createApp} from 'https://unpkg.com/vue@3/dist/vue.esm-browser.js'

const api ="https://administracion-de-requisiciones-it.onrender.com";
//const api = 'http://127.0.0.1:8000';
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
      prioridad: 3,
    razon_prioridad: ''
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
        ubicacion:this.ubicacion,
        prioridad: this.prioridad,
        razon_prioridad: this.razon_prioridad
      }

      try{
        const response = await fetch(`${api}/api/req`, {
          method: "POST",
          headers: {
            "Authorization": 'Bearer ' + sessionStorage.getItem("token"),
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
        sessionStorage.removeItem("token");
        sessionStorage.removeItem("user");
        sessionStorage.removeItem("userRole");
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
                throw new Error(`Error en la petición: ${resp.status}`);
            }

            const data = await resp.json();
            console.log("Respuesta de la API:", data);

            if(data.token){
                sessionStorage.setItem("token",data.token);
                sessionStorage.setItem("user", JSON.stringify(data.user));
                sessionStorage.setItem('userRole', data.user.role);
            }

            this.$emit("loggedIn", data.user);
              location.reload();
        }catch(error)
        {
            console.error("Error al iniciar", error);
            alert("No se pudo iniciar sesion");
        }

            }
        }

    }

    const adminPanel = {
      template:'#adminPanel',
      data(){
        return {
          usuarios: [],
          requisiciones: [],
        };
      },
      mounted(){
        this.cargarUsuarios();
        this.cargarRequisiciones();
        
      },
      methods:{
        async cargarUsuarios(){

          try{
      
            const resp = await fetch(`${api}/api/usuarios`, { headers: { 'Authorization': 'Bearer ' + sessionStorage.getItem('token') }});
            console.log(sessionStorage.getItem("token"));
            if (!resp.ok) {
      console.error('Error al cargar usuarios', resp.status);
      return;
    } 
            this.usuarios = await resp.json();
            this.usuarios.forEach(u => {
              u.rolselected = u.rol;
            });
          }catch (err){
                    console.error(err);
                    console.log("Error al cargar los usuario: "+err);
          }
        },

        async cambiarRol(user){
          const payload = {role:user.rolselected}

          try {
            const resp = await fetch(`${api}/api/usuarios/${user.id}/rol`,{
                method:'PUT',
                headers:{
                  "Authorization": 'Bearer ' + sessionStorage.getItem('token'),
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                },
                body: JSON.stringify(payload),
                
            });
            
            if (!resp.ok) throw new Error("Error al actualizar rol");
            alert(`Rol de ${user.name} actualizado`);
          } catch (err) {
            console.error(err);
                    console.log("Error al actualizar rol: "+err);
          }
        },

        async cargarRequisiciones(){
          try {
            const resp = await fetch(`${api}/api/req/activas`, { headers: { 'Authorization': 'Bearer ' + sessionStorage.getItem('token') } });
             this.requisiciones = await resp.json();
             this.requisiciones.forEach(u=>{
              u.prioridades = u.prioridad
             })
          } catch (error) {
            console.error(err);
                    console.log("Error al obtener requisiciones: "+err);
          }
        },

        async cambiarPrioridad(req){
          const payload = {prioridad: req.prioridades}
          try {

             const resp = await fetch(`${api}/api/requis/${req.id}/prioridad`,{
                method:'PUT',
                headers:{
                  "Authorization": 'Bearer ' + sessionStorage.getItem('token'),
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                },
                body: JSON.stringify(payload),
                
            });
            
            if (!resp.ok) throw new Error("Error al actualizar prioridad");

            alert(`Prioridad de la requisición #${req.id} actualizada`);
          } catch (error) {
            console.error(err);
                    console.log("Error al actualizar requisiciones: "+err);
          }
        },
        prioridadTexto(p) { if (p == 1) return "Alta"; if (p == 2) return "Media"; return "Baja"; }
      }
    }


    const Historial = {
        template: '#reqHist',
        data(){
            return{
                requisiciones:[],
                currentUser: JSON.parse(sessionStorage.getItem("user")) || null
            }
        },
        mounted(){
            this.fetchReq();
        },
        methods: {
            async fetchReq(){
                try{
                    const resp = await fetch(`${api}/api/req/historial`,{
                        headers:{
                            'Authorization': 'Bearer ' + sessionStorage.getItem("token"),
                            "Accept": "application/json"
                        }
                    });
                    if(!resp.ok) throw new Error ('Error al cargar las requisiciones');

                    this.requisiciones = await resp.json();
                }catch (err){
                    console.error(err);
                    alert("Error al cargar las requisiciones");
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
                        throw new Error(`Error en la petición: ${resp.status}`);
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
                userRole:sessionStorage.getItem("userRole"),
                requisiciones:[],
                currentUser: JSON.parse(sessionStorage.getItem("user")) || null
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
                            'Authorization': 'Bearer ' + sessionStorage.getItem("token"),
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
                const currentUser = JSON.parse(sessionStorage.getItem("user"));
                if(!confirm("Cerrar requisicion?")) return;

                try{
                    const resp = await fetch(`${api}/api/req/${id}/finalizar`,{
                        method: "PUT", // o POST según tu API
                        headers: {
                            'Authorization': 'Bearer ' + sessionStorage.getItem("token"),
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
            },
                getPrioridadClase(prioridad) {
                if (prioridad === 1) return 'table-danger';   
                if (prioridad === 2) return 'table-warning';  
                return 'table-success';                       
            },
            prioridadTexto(prioridad) {
                if (prioridad === 1) return 'Alta';
                if (prioridad === 2) return 'Media';
                return 'Baja';
            },
        }
    }

    const estadisticas = {
  props: ['user'],
  template: `
    <div class="container mt-4">
      <h3 class="mb-3">Estadísticas de Requisiciones Cerradas</h3>
      <canvas id="graficaRequisiciones"></canvas>
    </div>
  `,
  data() {
    return {
      chart: null
    }
  },
  mounted() {
    this.cargarDatos();
  },
  methods: {
    async cargarDatos() {
      try {
        const resp = await fetch(`${api}/api/req/historial`, {
          headers: {
            'Authorization': 'Bearer ' + sessionStorage.getItem("token"),
            'Accept': 'application/json'
          }
        });
        const data = await resp.json();

        const etiquetas = data.map(r => `#${r.id}`);
        const tiempos = data.map(r => {
          const inicio = new Date(r.created_at);
          const fin = new Date(r.updated_at);
          const diffHoras = (fin - inicio) / (1000 * 60 * 60);
          return diffHoras.toFixed(1);
        });

        const ctx = document.getElementById('graficaRequisiciones');

        
        if (this.chart) this.chart.destroy();

        this.chart = new Chart(ctx, {
          type: 'bar',
          data: {
            labels: etiquetas,
            datasets: [{
              label: 'Horas hasta cierre',
              data: tiempos,
              backgroundColor: tiempos.map(t =>
                t < 12 ? 'rgba(75, 192, 75, 0.6)' :
                t < 48 ? 'rgba(255, 206, 86, 0.6)' :
                         'rgba(255, 99, 132, 0.6)'
              ),
              borderColor: 'gray',
              borderWidth: 1
            }]
          },
          options: {
            responsive: true,
            scales: {
              y: {
                beginAtZero: true,
                title: { display: true, text: 'Horas' }
              }
            },
            plugins: {
              legend: { display: false },
              title: { display: true, text: 'Tiempo de vida por requisición' }
            }
          }
        });
      } catch (error) {
        console.error("Error al cargar estadísticas:", error);
      }
    }
  }
};

    const notificaciones = {
  template: `
    <div class="container mt-3">
      <h4> Notificaciones</h4>
      <ul class="list-group">
        <li v-for="n in notis" :key="n.id" class="list-group-item d-flex justify-content-between">
          {{ n.mensaje }}
          <button class="btn btn-sm btn-outline-success" @click="marcarLeida(n.id)">Marcar como leída</button>
        </li>
      </ul>
    </div>
  `,
  data() {
    return { notis: [] };
  },
  mounted() {
    this.cargarNotis();
  },
  methods: {
    async cargarNotis() {
      const resp = await fetch(`${api}/api/notificaciones`, {
        headers: {
          'Authorization': 'Bearer ' + sessionStorage.getItem("token"),
          'Accept': 'application/json'
        }
      });
      this.notis = await resp.json();
    },
    async marcarLeida(id) {
      await fetch(`${api}/api/notificaciones/${id}/leida`, {
        method: 'PUT',
        headers: {
          'Authorization': 'Bearer ' + sessionStorage.getItem("token"),
          'Accept': 'application/json'
        }
      });
      this.notis = this.notis.filter(n => n.id !== id);
    }
  }
};


    createApp({
        components: { 'admin-panel': adminPanel,'requisicion': requisicion, 'login':login, 'registro':reg, 'tabler':reqlist, 'historial':Historial,'notificaciones': notificaciones,'estadisticas': estadisticas },
        data(){
            return{
                hasToken: !!sessionStorage.getItem("token"),
                userRole:sessionStorage.getItem("userRole"),
                showRegister: false,
                currentUser: null,
                btnHist: 'Historial',
                shHist:false,
                rol: 'tecnico',
            };
        },
        computed: {
    mostrarHistorial() {
      return this.userRole == 1 || this.userRole == 2;
    }
  },
        
        methods:{
            handleLogin(user){
                this.currentUser = user;
                this.hasToken = true;
                this.rol = user.rol;
            },
            handleLogout() {
      this.hasToken = false;
       this.currentUser = null; 
       sessionStorage.clear();
    },
     handleRegistered() {
      this.showRegister = false;
    }
        }
    }).mount('#app');

