import axios from 'axios';

const service = axios.create({
    baseURL:"https://zaxd.fun",
    timeout:1000,
})

export default service;