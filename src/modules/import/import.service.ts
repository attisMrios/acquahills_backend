import { Injectable } from '@nestjs/common';
import { UserImportDto } from '../../common/dtos/inputs/user.input.dto';
import { ApartmentImportDto } from '../../common/dtos/inputs/apartment.input.dto';
import { parseXlsx } from '../../common/utils/parse-xlsx.utils';
import { writeErrorsToXlsx } from '../../common/utils/write-errors-xlsx.utils';
import { join } from 'path';
import { PrismaService } from '../../common/services/prisma.service';
import * as bcrypt from 'bcryptjs';
import { existsSync, mkdirSync } from 'fs';

@Injectable()
export class ImportService {
  constructor(private prisma: PrismaService) {}

  async importUsersFromBuffer(buffer: Buffer) {
    console.log('Procesando archivo con tamaño:', buffer.length);
    const rawData = parseXlsx<UserImportDto>(buffer);
    console.log('Datos extraídos del Excel:', rawData.length, 'filas');

    const validData: UserImportDto[] = [];
    const invalidData: { row: any; error: string }[] = [];
    const validationErrors: { row: any; error: string }[] = [];
    const createdUsers: any[] = [];

    // Primera pasada: validación manual
    for (const row of rawData) {
      const errors: string[] = [];
      
             // Validar campos requeridos
       if (!row.userName || row.userName.length < 3) {
         errors.push('userName: debe tener al menos 3 caracteres');
       }
       if (!row.fullName || row.fullName.length < 2) {
         errors.push('fullName: debe tener al menos 2 caracteres');
       }
       if (!row.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(row.email)) {
         errors.push('email: formato de correo electrónico inválido');
       }
       if (!row.dni || String(row.dni).length < 8) {
         errors.push('dni: debe tener al menos 8 caracteres');
       }
       if (!row.password || row.password.length < 8) {
         errors.push('password: debe tener al menos 8 caracteres');
       }
      
      if (errors.length > 0) {
        invalidData.push({ row, error: errors.join('; ') });
      } else {
        validData.push(row as UserImportDto);
      }
    }

    // Segunda pasada: validaciones de negocio y creación individual
    for (let i = 0; i < validData.length; i++) {
      const userData = validData[i];
      const originalRow = rawData.find(row => 
        row.email === userData.email && 
        row.userName === userData.userName && 
        row.dni === userData.dni
      );

      try {
        // Verificar si el email ya existe
        const existingEmail = await this.prisma.user.findUnique({
          where: { email: userData.email }
        });

        if (existingEmail) {
          validationErrors.push({ 
            row: originalRow, 
            error: 'El correo electrónico ya está registrado' 
          });
          continue;
        }

        // Verificar si el userName ya existe
        const existingUserName = await this.prisma.user.findUnique({
          where: { userName: userData.userName }
        });

        if (existingUserName) {
          validationErrors.push({ 
            row: originalRow, 
            error: 'El nombre de usuario ya está en uso' 
          });
          continue;
        }

                 // Verificar si el DNI ya existe
         const existingDni = await this.prisma.user.findUnique({
           where: { dni: String(userData.dni) }
         });

        if (existingDni) {
          validationErrors.push({ 
            row: originalRow, 
            error: 'El DNI ya está registrado' 
          });
          continue;
        }

                 // Encriptar la contraseña
         const hashedPassword = await bcrypt.hash(String(userData.password), 12);

                 // Crear el usuario individualmente
         const createdUser = await this.prisma.user.create({
           data: {
             userName: String(userData.userName),
             fullName: String(userData.fullName),
             email: String(userData.email),
             role: String(userData.role),
             fullPhone: userData.fullPhone ? String(userData.fullPhone) : null,
             address: userData.address ? String(userData.address) : null,
             dni: String(userData.dni),
             password: hashedPassword,
             birthDate: userData.birthDate ? new Date(userData.birthDate) : null,
             isEmailVerified: false
           }
         });

        createdUsers.push(createdUser);

      } catch (error) {
        // Capturar cualquier otro error inesperado
        validationErrors.push({ 
          row: originalRow, 
          error: `Error inesperado: ${error.message}` 
        });
      }
    }

    // Combinar todos los errores
    const allErrors = [...invalidData, ...validationErrors];
    let errorFileName: string | null = null;

    if (allErrors.length > 0) {
      const timestamp = Date.now();
      errorFileName = `errores-importacion-${timestamp}.xlsx`;
      const outputDir = join(process.cwd(), 'tmp');
      const outputPath = join(outputDir, errorFileName);
      
      console.log('Directorio de salida:', outputDir);
      console.log('¿Existe el directorio?', existsSync(outputDir));
      
      // Crear el directorio si no existe
      if (!existsSync(outputDir)) {
        console.log('Creando directorio...');
        mkdirSync(outputDir, { recursive: true });
        console.log('Directorio creado exitosamente');
      }
      
      console.log('Escribiendo archivo en:', outputPath);
      writeErrorsToXlsx(allErrors, outputPath);
      console.log('Archivo escrito exitosamente');
    }

    return {
      inserted: createdUsers.length,
      errors: allErrors.length,
      errorFile: errorFileName,
      details: {
        schemaErrors: invalidData.length,
        validationErrors: validationErrors.length,
        successfulImports: createdUsers.length
      }
    };
  }

  async importApartmentsFromBuffer(buffer: Buffer) {
    console.log('Procesando archivo de apartamentos con tamaño:', buffer.length);
    const rawData = parseXlsx<ApartmentImportDto>(buffer);
    console.log('Datos extraídos del Excel:', rawData.length, 'filas');

    const validData: ApartmentImportDto[] = [];
    const invalidData: { row: any; error: string }[] = [];
    const validationErrors: { row: any; error: string }[] = [];
    const createdApartments: any[] = [];

    // Primera pasada: validación manual
    for (const row of rawData) {
      const errors: string[] = [];
      
      // Validar campos requeridos
      if (!row.apartment || String(row.apartment).length < 1) {
        errors.push('apartment: el número de apartamento es requerido');
      }
      if (!row.house || String(row.house).length < 1) {
        errors.push('house: el número de casa es requerido');
      }
      if (!row.fullAddress || String(row.fullAddress).length < 1) {
        errors.push('fullAddress: la dirección completa es requerida');
      }
      if (!row.block || String(row.block).length < 1) {
        errors.push('block: el bloque es requerido');
      }
      if (!row.floor || String(row.floor).length < 1) {
        errors.push('floor: el piso es requerido');
      }
      if (!row.tower || String(row.tower).length < 1) {
        errors.push('tower: la torre es requerida');
      }
      
      if (errors.length > 0) {
        invalidData.push({ row, error: errors.join('; ') });
      } else {
        validData.push(row as ApartmentImportDto);
      }
    }

    // Segunda pasada: validaciones de negocio y creación individual
    for (let i = 0; i < validData.length; i++) {
      const apartmentData = validData[i];
      const originalRow = rawData.find(row => 
        String(row.apartment) === String(apartmentData.apartment) && 
        String(row.house) === String(apartmentData.house) &&
        String(row.tower) === String(apartmentData.tower)
      );

      try {
        // Verificar si el apartamento ya existe (combinación única de apartment, house, tower)
        const existingApartment = await this.prisma.apartment.findFirst({
          where: {
            apartment: String(apartmentData.apartment),
            house: String(apartmentData.house),
            tower: String(apartmentData.tower)
          }
        });

        if (existingApartment) {
          validationErrors.push({ 
            row: originalRow, 
            error: 'El apartamento ya existe (misma combinación de apartment, house, tower)' 
          });
          continue;
        }

        // Crear el apartamento individualmente
        const createdApartment = await this.prisma.apartment.create({
          data: {
            apartment: String(apartmentData.apartment),
            house: String(apartmentData.house),
            fullAddress: String(apartmentData.fullAddress),
            block: String(apartmentData.block),
            floor: String(apartmentData.floor),
            tower: String(apartmentData.tower)
          }
        });

        createdApartments.push(createdApartment);

      } catch (error) {
        // Capturar cualquier otro error inesperado
        validationErrors.push({ 
          row: originalRow, 
          error: `Error inesperado: ${error.message}` 
        });
      }
    }

    // Combinar todos los errores
    const allErrors = [...invalidData, ...validationErrors];
    let errorFileName: string | null = null;

    if (allErrors.length > 0) {
      const timestamp = Date.now();
      errorFileName = `errores-importacion-apartamentos-${timestamp}.xlsx`;
      const outputDir = join(process.cwd(), 'tmp');
      const outputPath = join(outputDir, errorFileName);
      
      console.log('Directorio de salida:', outputDir);
      console.log('¿Existe el directorio?', existsSync(outputDir));
      
      // Crear el directorio si no existe
      if (!existsSync(outputDir)) {
        console.log('Creando directorio...');
        mkdirSync(outputDir, { recursive: true });
        console.log('Directorio creado exitosamente');
      }
      
      console.log('Escribiendo archivo en:', outputPath);
      writeErrorsToXlsx(allErrors, outputPath);
      console.log('Archivo escrito exitosamente');
    }

    return {
      inserted: createdApartments.length,
      errors: allErrors.length,
      errorFile: errorFileName,
      details: {
        schemaErrors: invalidData.length,
        validationErrors: validationErrors.length,
        successfulImports: createdApartments.length
      }
    };
  }
}
