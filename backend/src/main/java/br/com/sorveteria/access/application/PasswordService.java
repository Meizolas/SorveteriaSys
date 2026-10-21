package br.com.sorveteria.access.application;

import java.util.Arrays;
import org.springframework.security.crypto.argon2.Argon2PasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class PasswordService {
  private final PasswordEncoder encoder = Argon2PasswordEncoder.defaultsForSpringSecurity_v5_8();

  public String hash(char[] password) {
    validate(password);
    try {
      return encoder.encode(new String(password));
    } finally {
      Arrays.fill(password, '\0');
    }
  }

  public boolean matches(char[] password, String encoded) {
    try {
      if (encoded == null || !encoded.startsWith("$argon2id$")) {
        return false;
      }
      return encoder.matches(new String(password), encoded);
    } finally {
      Arrays.fill(password, '\0');
    }
  }

  public void validate(char[] password) {
    if (password == null || password.length < 12 || password.length > 128) {
      throw new IllegalArgumentException("A senha deve ter entre 12 e 128 caracteres");
    }
  }
}
