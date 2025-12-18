"use client";

import { z } from "zod";
import Image from "next/image";
import { toast } from "sonner";
import { auth } from "@/firebase/client";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";

import { signInWithEmailAndPassword } from "firebase/auth";

import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";

import { signIn } from "@/lib/actions/auth.action";
import FormField from "./FormField";

const authFormSchema = z.object({
  email: z.string().email("Email noto'g'ri"),
  password: z.string().min(6, "Parol kamida 6 belgi bo'lishi kerak"),
});

// Client-side role checking (duplicated from server-side for consistency)
function getRedirectPathForRole(role: string): string {
  if (role === "teacher") return "/Teacher";
  if (role === "student") return "/Student";
  
  // Admin-level roles
  if (role === "admin" || 
      role === "administrator" || 
      role === "Administrator" || 
      role === "Admin" ||
      role === "employee" ||
      role === "manager" ||
      role === "Manager") {
    return "/Admin";
  }
  
  // Default fallback
  return "/Admin";
}

const AuthForm = () => {
  const router = useRouter();

  const form = useForm<z.infer<typeof authFormSchema>>({
    resolver: zodResolver(authFormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof authFormSchema>) => {
    try {
      const { email, password } = data;

      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      const idToken = await userCredential.user.getIdToken();
      if (!idToken) {
        toast.error("Kirishda xatolik. Qaytadan urinib ko'ring.");
        return;
      }

      const res = await signIn({
        email,
        idToken,
      });

      if (res?.success === false) {
        toast.error(res.message);
        return;
      }

      toast.success("Tizimga muvaffaqiyatli kirdingiz.");
      
      // Use centralized role-based redirect logic
      if (res?.role) {
        router.push(getRedirectPathForRole(res.role));
      } else {
        router.push("/Admin"); // Fallback
      }
    } catch (error: any) {
      console.log(error);
      toast.error(`Xatolik yuz berdi: ${error.message}`);
    }
  };

  return (
    <div className="card-border lg:min-w-[566px]">
      <div className="flex flex-col gap-6 card py-14 px-10">
        <div className="flex flex-row gap-2 justify-center">
          <Image src="/logo.svg" alt="logo" height={32} width={38} />
          <h2 className="text-primary-100">Kitob AI</h2>
        </div>

        <h3>Sun'iy intellekt bilan kitoblar haqida suhbatlashing</h3>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="w-full space-y-6 mt-4 form"
          >
            <FormField
              control={form.control}
              name="email"
              label="Email"
              placeholder="Email manzilingiz"
              type="email"
            />

            <FormField
              control={form.control}
              name="password"
              label="Parol"
              placeholder="Parolingiz"
              type="password"
            />

            <Button className="btn" type="submit">
              Kirish
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default AuthForm;