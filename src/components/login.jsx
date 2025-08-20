import React, { useEffect, useState } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from './ui/input'
import { Button } from './ui/button'
import { BeatLoader } from 'react-spinners'
import Error from './error'
import * as Yup from 'yup'
import useFetch from '../hooks/use-fetch'
import { login } from '../db/apiAuth'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { UrlState } from '@/context'

const Login = () => {
    const [errors, seterrros] = useState([])
    const [formdata, setformdata] = useState({
        email: "",
        password: ""
    })

    const navigate = useNavigate()
    let [searchParams] = useSearchParams()
    const longlink = searchParams.get("createNew")

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setformdata((prevState)=>({
            ...prevState,
        [name]: value,
        }))
    }

    const {data,error,loading,fn:fnlogin} = useFetch(login,formdata)
    const {fetchuser} = UrlState()
    useEffect(() => {
        if (data && !error) {
            navigate(`/dashboard?${longlink?`createNew=${longlink}`:""}`)
            fetchuser()
            }
        }, [data, error])

    const handleLogin=async() => {
        seterrros([])
        try{
            const schema = Yup.object().shape({
                email: Yup.string().email("Invalid email").required("Email is required"),
                password: Yup.string().min(6, "Password must be at least 6 characters").required("Password is required")
            })
        await schema.validate(formdata, { abortEarly: false })
        await fnlogin(formdata)
        }
        catch (e){
            const newerrors={}
            e?.inner?.forEach(element => {
                newerrors[element.path] = element.message
            })
            seterrros(newerrors)
        }
    }

  return (
    <Card>
        <CardHeader>
            <CardTitle>Login</CardTitle>
            <CardDescription>Login to your account if available</CardDescription>
            {error && <Error message={error.message}/>}
        </CardHeader>
        <CardContent className="space-y-2">
            <div className="space-y-1">
                <Input name="email" type="email" placeholder="Enter Email" onChange={handleInputChange}/>
                {errors.email && <Error message={errors.email}/>}
            </div>
             <div className="space-y-1">
                <Input name="password" type="password" placeholder="Enter Password" onChange={handleInputChange}/>
                {errors.password && <Error message={errors.password}/>}
            </div>
        </CardContent>
        <CardFooter>
            <Button onClick={handleLogin}>{loading?<BeatLoader size={10} color="blue"/> : "Login"}</Button>
        </CardFooter>
    </Card>
  )
}

export default Login