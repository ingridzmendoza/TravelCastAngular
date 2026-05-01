import { HttpInterceptorFn } from '@angular/common/http';
import { tap } from 'rxjs';

export const loggingInterceptor: HttpInterceptorFn = (req, next) => {
  console.log('Request:', req.url);

  return next(req).pipe(
    tap(() => console.log('Response received from:', req.url))
  );
};