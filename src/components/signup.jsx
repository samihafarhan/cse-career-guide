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
import { signup } from '../db/apiAuth'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { UrlState } from '@/context'

const Signup = () => {
    const [errors, setErrors] = useState([])
    const [formData, setFormData] = useState({
        email: "",
        password: "",
        confirmPassword: ""
    })

    const navigate = useNavigate()
    let [searchParams] = useSearchParams()
    const longlink = searchParams.get("createNew")

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormData((prevState) => ({
            ...prevState,
            [name]: value,
        }))
    }

    const { data, error, loading, fn: fnSignup } = useFetch(signup, formData)
    const { fetchuser } = UrlState()
    
    useEffect(() => {
        if (data && !error) {
            navigate(`/dashboard?${longlink ? `createNew=${longlink}` : ""}`)
            fetchuser()
        }
    }, [data, error])

    const handleSignup = async () => {
        setErrors([])
        try {
            const schema = Yup.object().shape({
                email: Yup.string().email("Invalid email").required("Email is required"),
                password: Yup.string().min(6, "Password must be at least 6 characters").required("Password is required"),
                confirmPassword: Yup.string()
                    .oneOf([Yup.ref('password')], 'Passwords must match')
                    .required("Please confirm your password")
            })
            await schema.validate(formData, { abortEarly: false })
            await fnSignup({ email: formData.email, password: formData.password })
        }
        catch (e) {
            const newErrors = {}
            e?.inner?.forEach(element => {
                newErrors[element.path] = element.message
            })
            setErrors(newErrors)
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Sign Up</CardTitle>
                <CardDescription>Create a new account to get started</CardDescription>
                {error && <Error message={error.message} />}
            </CardHeader>
            <CardContent className="space-y-2">
                <div className="space-y-1">
                    <Input 
                        name="email" 
                        type="email" 
                        placeholder="Enter Email" 
                        onChange={handleInputChange}
                        value={formData.email}
                    />
                    {errors.email && <Error message={errors.email} />}
                </div>
                <div className="space-y-1">
                    <Input 
                        name="password" 
                        type="password" 
                        placeholder="Enter Password" 
                        onChange={handleInputChange}
                        value={formData.password}
                    />
                    {errors.password && <Error message={errors.password} />}
                </div>
                <div className="space-y-1">
                    <Input 
                        name="confirmPassword" 
                        type="password" 
                        placeholder="Confirm Password" 
                        onChange={handleInputChange}
                        value={formData.confirmPassword}
                    />
                    {errors.confirmPassword && <Error message={errors.confirmPassword} />}
                </div>
            </CardContent>
            <CardFooter>
                <Button onClick={handleSignup}>
                    {loading ? <BeatLoader size={10} color="blue" /> : "Sign Up"}
                </Button>
            </CardFooter>
        </Card>
    )
}

export default Signup