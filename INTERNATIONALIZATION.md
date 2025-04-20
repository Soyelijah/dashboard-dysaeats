# DysaEats Internationalization System

This document provides an overview of the internationalization (i18n) system implemented in the DysaEats project, allowing the application to support multiple languages (currently English and Spanish).

## Web Application (Next.js)

The web application uses Next.js internationalized routing with the App Router architecture.

### Directory Structure

```
dashboard-web/
├── src/
│   ├── lib/
│   │   └── dictionary.ts      # Core functionality for dictionary loading
│   ├── dictionaries/
│   │   ├── en.json            # English translations
│   │   └── es.json            # Spanish translations
│   └── app/
│       └── [lang]/            # Dynamic route segment for language
│           ├── layout.tsx     # Root layout for internationalized routes
│           ├── (auth)/        # Group for auth pages
│           │   └── login/     # Login page
│           └── (dashboard)/   # Group for dashboard pages
│               └── dashboard/ # Dashboard page
```

### Key Components

1. **dictionary.ts**: Handles dynamic loading of translation dictionaries
   ```typescript
   import 'server-only';
   
   const dictionaries = {
     en: () => import('../dictionaries/en.json').then(module => module.default),
     es: () => import('../dictionaries/es.json').then(module => module.default)
   };
   
   export const getDictionary = async (locale: string) => {
     return dictionaries[locale as keyof typeof dictionaries]?.() ?? dictionaries.es();
   };
   ```

2. **[lang]/layout.tsx**: Root layout for handling language parameter
   ```typescript
   export async function generateStaticParams() {
     return [{ lang: 'en' }, { lang: 'es' }];
   }
   
   export default async function RootLayout({
     children,
     params,
   }: {
     children: ReactNode;
     params: { lang: string };
   }) {
     const dict = await getDictionary(params.lang);
     // ...
   }
   ```

3. **Login Form**: Client component using translations
   ```typescript
   const loginSchema = z.object({
     email: z.string().email(dict.auth.invalidFormat),
     password: z.string().min(1, dict.auth.requiredField),
   });
   ```

4. **Language Switching**: Example from dashboard page
   ```typescript
   <Link href={`/${params.lang === 'es' ? 'en' : 'es'}/dashboard`}>
     {params.lang === 'es' ? 'Switch to English' : 'Cambiar a Español'}
   </Link>
   ```

## Mobile Application (React Native)

The mobile application uses i18n-js with Expo Localization.

### Directory Structure

```
dashboard-mobile/
├── src/
│   ├── lib/
│   │   └── i18n.ts            # i18n configuration
│   ├── localization/
│   │   ├── en.json            # English translations
│   │   └── es.json            # Spanish translations
│   ├── components/
│   │   └── common/
│   │       └── LanguageSwitcher.tsx # Component for switching languages
│   └── screens/
│       ├── auth/
│       │   └── LoginScreen.tsx # Example screen with i18n
│       └── app/
│           └── HomeScreen.tsx  # Dashboard screen with i18n
```

### Key Components

1. **i18n.ts**: Configuration for i18n-js
   ```typescript
   import { I18n } from 'i18n-js';
   import * as Localization from 'expo-localization';
   import en from '../localization/en.json';
   import es from '../localization/es.json';
   
   const i18n = new I18n({ en, es });
   i18n.locale = Localization.locale.split('-')[0];
   i18n.enableFallback = true;
   i18n.defaultLocale = 'es';
   
   export const changeLanguage = (locale: string): void => {
     i18n.locale = locale;
   };
   
   export const getCurrentLocale = (): string => {
     return i18n.locale;
   };
   ```

2. **LanguageSwitcher.tsx**: Component for switching languages
   ```typescript
   const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ style }) => {
     const currentLocale = getCurrentLocale();
     
     return (
       <View style={[styles.container, style]}>
         <TouchableOpacity
           style={[styles.button, { backgroundColor: currentLocale === 'en' ? '#3b82f6' : '#e5e7eb' }]}
           onPress={() => changeLanguage('en')}
         >
           <Text>English</Text>
         </TouchableOpacity>
         <TouchableOpacity
           style={[styles.button, { backgroundColor: currentLocale === 'es' ? '#3b82f6' : '#e5e7eb' }]}
           onPress={() => changeLanguage('es')}
         >
           <Text>Español</Text>
         </TouchableOpacity>
       </View>
     );
   };
   ```

3. **Usage in Components**: 
   ```typescript
   <Text>{i18n.t('common.welcome')}</Text>
   <Text>{i18n.t('auth.email')}</Text>
   ```

## Backend (NestJS)

The backend uses nestjs-i18n for server-side internationalization.

### Directory Structure

```
backend/
├── src/
│   ├── config/
│   │   └── i18n.config.ts     # i18n configuration
│   ├── shared/
│   │   ├── i18n/              # Translation files
│   │   │   ├── en/            # English translations
│   │   │   │   ├── api.json   # API messages
│   │   │   │   └── validation.json # Validation messages
│   │   │   └── es/            # Spanish translations
│   │   │       ├── api.json   # API messages
│   │   │       └── validation.json # Validation messages
│   │   ├── decorators/
│   │   │   └── language.decorator.ts # Extract language from request
│   │   └── middlewares/
│   │       └── language.middleware.ts # Middleware for language detection
│   └── modules/
│       └── auth/
│           ├── auth.controller.ts # Controller with i18n usage
│           └── dto/
│               └── register.dto.ts # DTO with i18n validation messages
```

### Key Components

1. **i18n.config.ts**: Configuration for nestjs-i18n
   ```typescript
   export const i18nConfig: I18nOptions = {
     fallbackLanguage: 'es',
     loaderOptions: {
       path: path.join(__dirname, '../shared/i18n/'),
       watch: true,
     },
   };
   
   export enum SupportedLanguages {
     EN = 'en',
     ES = 'es',
   }
   ```

2. **language.decorator.ts**: Extracts language from request
   ```typescript
   export const Language = createParamDecorator(
     (data: unknown, ctx: ExecutionContext) => {
       const request = ctx.switchToHttp().getRequest();
       
       // Check headers, query params, cookies
       // ...
       
       // Default language
       return DEFAULT_LANGUAGE;
     },
   );
   ```

3. **auth.controller.ts**: Usage in controllers
   ```typescript
   @Post('login')
   async login(
     @Body() loginDto: LoginDto, 
     @GetUser() user: User,
     @Language() lang: string,
     @I18n() i18n: I18nContext
   ) {
     const result = await this.authService.login(user);
     return {
       message: i18n.t('api.auth.loggedIn', { lang }),
       ...result,
     };
   }
   ```

4. **register.dto.ts**: Validation with i18n messages
   ```typescript
   @IsEmail({}, { message: i18nValidationMessage('validation.email') })
   @IsNotEmpty({ message: i18nValidationMessage('validation.required', { field: 'email' }) })
   email: string;
   ```

## Best Practices

1. **Structure Translations by Feature**: Organize translations by feature area (auth, orders, etc.)
2. **Use Nested Objects**: Group related translations in nested objects
3. **Use Parameters**: For dynamic content, use parameters in translation strings
4. **Default Language**: Always set Spanish as the default language
5. **Validation Messages**: Use i18n for validation messages for consistent error reporting
6. **Consistent Keys**: Use consistent naming conventions for translation keys

## Testing Internationalization

1. **Web**: Navigate to `/en/...` or `/es/...` URLs
2. **Mobile**: Use the LanguageSwitcher component
3. **API**: Set the `Accept-Language` header or `lang` query parameter

## Extending to New Languages

To add a new language:

1. Add the language code to the supported languages enum
2. Create new translation files for each component
3. Update the language switcher components to include the new language