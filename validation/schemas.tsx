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
  
  export const Addcustomer= Yup.object({
      customerType: Yup.string().required("Customer type is required"),
      firstName: Yup.string().required("Name is required"),
      lastName: Yup.string(),
      displayName: Yup.string().required("Display name is required"),
      email: Yup.string().email("Invalid email").required("Email is required"),
      workPhone: Yup.string(),
      mobilePhone: Yup.string(),
      billingAddress: Yup.object({
        street1: Yup.string().required("Street 1 is required"),
        street2: Yup.string(),
        city: Yup.string().required("City is required"),
        state: Yup.string().required("State is required"),
        pinCode: Yup.string().required("Pin code is required"),
        country: Yup.string().required("Country is required"),
      }),
      shippingAddress: Yup.object({
        street1: Yup.string(),
        street2: Yup.string(),
        city: Yup.string(),
        state: Yup.string(),
        pinCode: Yup.string(),
        country: Yup.string(),
      }),
      companyName: Yup.string(),
      taxId: Yup.string(),
      currency: Yup.string(),
      creditLimit: Yup.number(),
      notes: Yup.string(),
      contacts: Yup.array().of(
        Yup.object({
          name: Yup.string().required("Contact name is required"),
          email: Yup.string().email("Invalid email").required("Email is required"),
          workPhone: Yup.string(),
          mobilePhone: Yup.string(),
          designation: Yup.string(),
        })
      ),
      status: Yup.string().required("Status is required"),
    });