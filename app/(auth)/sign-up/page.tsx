'use client'
import {SubmitHandler, useForm} from "react-hook-form";
import {Button} from "@/components/ui/button";
import InputField from "@/components/forms/inputField";
import SelectField from "@/components/forms/SelectField";
import {INVESTMENT_GOALS, PREFERRED_INDUSTRIES, RISK_TOLERANCE_OPTIONS} from "@/lib/constants";
import CountrySelectorField from "@/components/forms/CountrySelectorField";
import FooterLink from "@/components/forms/FooterLink";





const SignUp = () => {
    const {
        register,
        handleSubmit ,
        control ,
        formState:{errors , isSubmitting},
    } = useForm<SignUpFormData>(
        {
            defaultValues:{
                fullName:"",
                email:"",
                password:"",
                country:"US",
                investmentGoals:"Growth",
                riskTolerance:"Medium",
                preferredIndustry:"Technology"
            },
            mode:"onBlur"},
    );
    const onSubmit = async (data:SignUpFormData)=>{
        try{
            console.log(data)
        }
        catch(e){
            console.error(e)
        }
    }
    return (
        <>
            <h1  className={"form-title"}>Sign Up & Personalize</h1>

            <form onSubmit={handleSubmit(onSubmit)}  className={"space-y-5"}>
            <InputField
                name={"fullName"}
                label={"Full Name"}
                placeholder={"Joao "}
                register = {register}
                error = {errors.fullName}
                validation={{required:'Full name is required' , minLength:2 }}></InputField>

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

                <CountrySelectorField
                    control={control}
                    name="country"
                    label="Country"
                    required
                />

            <SelectField
                name={"investmentGoals"}
                label={"Investment Goals"}
                placeholder={"Select your investment goal"}
                options={INVESTMENT_GOALS}
                control={control}
                error={errors.investmentGoals}
                required/>

            <SelectField
                name={"riskTolerance"}
                label={"Risk Tolerance"}
                placeholder={"Select your risk level"}
                options={RISK_TOLERANCE_OPTIONS}
                control={control}
                error={errors.riskTolerance}
                required/>

            <SelectField
                name={"preferredIndustry"}
                label={"Preferred Industry"}
                placeholder={"Select your preferred industry"}
                options={PREFERRED_INDUSTRIES}
                control={control}
                error={errors.preferredIndustry}
                required/>

            <Button type={"submit"} disabled={isSubmitting} className={"yellow-btn w-full mt-5"}>
                {isSubmitting ? "Creating account" : "Start your investing journey"}
            </Button>
                <FooterLink text={"Already have an account "} linkText={"Sign in"} href={"/sign-in"}></FooterLink>

            </form>
        </>
    )
}
export default SignUp
