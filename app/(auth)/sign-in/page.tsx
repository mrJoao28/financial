'use client'

import {useForm} from "react-hook-form";
import InputField from "@/components/forms/inputField";

import {Button} from "@/components/ui/button";
import FooterLink from "@/components/forms/FooterLink";


const SignIn = () => {
    const {
        register,
        handleSubmit ,

        formState:{errors , isSubmitting},
    } = useForm<SignInFormData>(
        {
            defaultValues:{
                email:"",
                password:"",
            },
            mode:"onBlur"},
    );
    const onSubmit = async (data:SignInFormData)=>{
        try{
            console.log(data)
        }
        catch(e){
            console.error(e)
        }
    }
    return (
        <>
            <h1  className={"form-title"}>Login In Your Account</h1>

            <form onSubmit={handleSubmit(onSubmit)}  className={"space-y-5"}>

                <InputField
                    name={"email"}
                    label={"Email"}
                    placeholder={"joao123@gmail.com "}
                    register = {register}
                    error = {errors.email}
                    validation={{required:'Email is required' , pattern:/^\w+@\w+$/, message:"Email address is required" }}></InputField>

                <InputField
                    name={"password"}
                    label={"Password"}
                    placeholder={"Enter a strong password"}
                    type={"password"}
                    register = {register}
                    error = {errors.password}
                    validation={{required:'Password is required' , minLength:8 }}></InputField>



                <Button type={"submit"} disabled={isSubmitting} className={"yellow-btn w-full mt-5"}>
                    {isSubmitting ? "Logging" : "Starting the machine"}
                </Button>
                <FooterLink text={"Dosent hava an account "} linkText={"Sign up"} href={"/sign-up"}></FooterLink>

            </form>
        </>
    )
}
export default SignIn
