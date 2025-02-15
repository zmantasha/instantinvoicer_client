import *as Yup from 'yup'
export const registerSchema=Yup.object({
    firstName:Yup.string().required("firstName is required  *"),
    // lastName:Yup.string(),
    email: Yup.string().email().required("email is required  *"),
    password: Yup.string().required("password is required  *"),
    confirmPassword: Yup.string()
    .required("Confirm Password is required *")
    .oneOf([Yup.ref("password")], "Password and Confirm Password doesn't match"),

})

// login user Shema
export const loginSchema=Yup.object({
    email: Yup.string().email().required("email is required"),
    password: Yup.string().required("password is required"),
})

// update user porfile schema
export const updateSchema=Yup.object({
    firstName:Yup.string().required("firstName is required"),
    lastName:Yup.string(),
})

// invoice Item schema

export const InvoiceItem =Yup.object({
  senderName: Yup.string().required('Sender name is required'),
  senderAddress: Yup.string().required('Sender address is required'),
  billToName: Yup.string().required('Bill to name is required'),
  billToAddress: Yup.string().required('Bill to address is required'),
  shipToName: Yup.string(),
  shipToAddress: Yup.string(),
  invoiceNumber: Yup.string().required('Invoice number is required'),
  invoiceDate: Yup.date().required('Invoice date is required'),
  dueDate: Yup.date().required('Due date is required'),
  paymentTerms: Yup.string(),
  poNumber: Yup.string(),
  });
  