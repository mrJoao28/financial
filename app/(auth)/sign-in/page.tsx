'use client'

import {SubmitHandler, useForm} from "react-hook-form";
import InputField from "@/components/forms/inputField";

import {Button} from "@/components/ui/button";
import FooterLink from "@/components/forms/FooterLink";
import {signInWIthEmail} from "@/lib/actions/auth.actions";
import {toast} from "sonner";
import {useRouter} from "next/navigation";

const SignIn = () => {
    const router = useRouter()
    const {
        register,
        handleSubmit,

        formState: {errors, isSubmitting},
    } = useForm<SignInFormData>(
        {
            defaultValues: {
                email: "",
                password: "",
            },
            mode: "onBlur"
        },
    );

    const onSubmit: SubmitHandler<SignInFormData> = async (data) => {
        try {
            const result = await signInWIthEmail(data)
            if (result.sucess) {
                router.push("/");
            } else {
                toast.error("Sign in failed", {
                    description: result.error || "Failed to access an account"
                })
            }
        }
        catch (e) {
            console.error(e);
            toast.error("Sign in failed", {
                description: e instanceof Error ? e.message : "Failed to access an account"
            })
        }
    }

    return (
        <>
            <h1 className={"form-title"}>Login In Your Account</h1>

            <form onSubmit={handleSubmit(onSubmit)} className={"space-y-5"}>

                <InputField
                    name={"email"}
                    label={"Email"}
                    placeholder={"joao123@gmail.com "}
                    register={register}
                    error={errors.email}
                    validation={{
                        required: 'Email is required',
                        pattern: {
                            value: /^[\w.+-]+@[\w-]+\.[a-zA-Z]{2,}$/,
                            message: "Invalid email address"
                        }
                    }}
                />

                <InputField
                    name={"password"}
                    label={"Password"}
                    placeholder={"Enter a strong password"}
                    type={"password"}
                    register={register}
                    error={errors.password}
                    validation={{
                        required: 'Password is required',
                        minLength: {
                            value: 8,
                            message: "Password must be at least 8 characters"
                        }
                    }}
                />

                <Button type={"submit"} disabled={isSubmitting} className={"yellow-btn w-full mt-5"}>
                    {isSubmitting ? "Logging" : "Starting the machine"}
                </Button>

                <FooterLink text={"Dosent hava an account "} linkText={"Sign up"} href={"/sign-up"} />

            </form>
        </>
    )
}
export default SignIn