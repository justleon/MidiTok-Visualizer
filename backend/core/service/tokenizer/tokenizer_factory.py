from miditok import MusicTokenizer, TokenizerConfig

from core.service.tokenizer.tokenizers.cpword_tokenizer import CPWordTokenizer
from core.service.tokenizer.tokenizers.midilike_tokenizer import MIDILikeTokenizer
from core.service.tokenizer.tokenizers.MMM_tokenizer import MMMTokenizer
from core.service.tokenizer.tokenizers.muMIDI_tokenizer import MuMIDITokenizer
from core.service.tokenizer.tokenizers.octuple_tokenizer import OctupleTokenizer
from core.service.tokenizer.tokenizers.perTok_tokenizer import PerTokTokenizer
from core.service.tokenizer.tokenizers.remi_tokenizer import REMITokenizer
from core.service.tokenizer.tokenizers.structured_tokenizer import StructuredTokenizer
from core.service.tokenizer.tokenizers.tsd_tokenizer import TSDTokenizer


class TokenizerFactory:
    """
    Factory class for creating and mapping for MIDI tokenizers.
    """
    _registry = {}

    @classmethod
    def register_tokenizer(cls, tokenizer_type: str, tokenizer_cls):
        """
        Register a new tokenizer type with its implementation class.

        This method adds a new tokenizer type to the factory's registry, allowing it
        to be created later using the get_tokenizer method.

        Args:
            tokenizer_type: A string identifier for the tokenizer type (e.g., "REMI", "MIDILike").
            tokenizer_cls: The tokenizer class implementation to associate with this type.
                The class should be a subclass of MusicTokenizer.
        """
        cls._registry[tokenizer_type] = tokenizer_cls

    @classmethod
    def get_tokenizer(cls, tokenizer_type: str, config: TokenizerConfig) -> MusicTokenizer:
        """
        Create and return a tokenizer instance of the specified type.

        This method looks up the requested tokenizer type in the registry and creates
        a new instance with the provided configuration.

        Args:
            tokenizer_type: The type of tokenizer to create (e.g., "REMI", "MIDILike").
                Must be a type that has been registered with register_tokenizer.
            config: A TokenizerConfig object containing the configuration parameters
                for the tokenizer.

        Returns:
            A new instance of the requested tokenizer type, initialized with the provided
            configuration.

        Raises:
            ValueError: If the requested tokenizer type is not registered.
        """
        if tokenizer_type not in cls._registry:
            raise ValueError(tokenizer_type)
        return cls._registry[tokenizer_type](config)


TokenizerFactory.register_tokenizer("REMI", REMITokenizer)
TokenizerFactory.register_tokenizer("MIDILike", MIDILikeTokenizer)
TokenizerFactory.register_tokenizer("TSD", TSDTokenizer)
TokenizerFactory.register_tokenizer("Structured", StructuredTokenizer)
TokenizerFactory.register_tokenizer("CPWord", CPWordTokenizer)
TokenizerFactory.register_tokenizer("Octuple", OctupleTokenizer)
TokenizerFactory.register_tokenizer("MuMIDI", MuMIDITokenizer)
TokenizerFactory.register_tokenizer("MMM", MMMTokenizer)
TokenizerFactory.register_tokenizer("PerTok", PerTokTokenizer)
