export interface IGenericResponse<T> {
  success: boolean;
  data: T;
}


export interface IUser {
  email: string;
  username: string;
  _id: string;
  firstName: string;
  lastName: string;
  bussinessName: string;
  bussinessSector: string;
  address: IUserAddress;
  phone: string;
  VAT: string;
  DOI: string;
  active: boolean;
}

export interface IUserAddress {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}